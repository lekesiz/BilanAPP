const express = require('express');

const router = express.Router();
const { ensureAuthenticated, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
// Remove requires handled by the controller
// const { Message, Beneficiary, User } = require('../models');
// const { Op } = require('sequelize');
// const sequelize = require('../config/database');

// Require the new controller
const messageController = require('../controllers/messageController');

// Liste des conversations
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  messageController.listConversations,
);

// Formulaire pour envoyer un nouveau message
router.get(
  '/new',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  messageController.showNewMessageForm,
);

// Traitement de l'envoi d'un nouveau message
router.post(
  '/new',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  messageController.sendMessage,
);

// Marquer un message comme lu (AJAX endpoint olabilir)
// router.post('/:id/read', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => { ... });

// Supprimer un message (genellikle önerilmez, konuşmayı silmek daha iyi olabilir)
// router.post('/:id/delete', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => { ... });

// Bir konuşmayı görüntüle
router.get(
  '/conversation/:participantId',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  messageController.showConversation,
);

// Debug route - for checking unread messages count
router.get(
  '/debug/unread',
  ensureAuthenticated,
  async (req, res) => {
    try {
      const isConsultant = req.user.userType === 'consultant';
      const isBeneficiary = req.user.userType === 'beneficiary';
      let unreadMessages = [];

      if (isConsultant) {
        // For consultants, get unread messages from their beneficiaries
        unreadMessages = await Message.findAll({
          where: {
            consultantId: req.user.id,
            senderId: { [Op.ne]: req.user.id },
            isRead: false
          },
          include: [
            { model: User, as: 'sender' },
            { model: Beneficiary, as: 'beneficiary' }
          ]
        });
      } else if (isBeneficiary) {
        // Find beneficiary profile
        const beneficiaryProfile = await Beneficiary.findOne({
          where: { userId: req.user.id }
        });
        
        if (beneficiaryProfile) {
          // For beneficiaries, get unread messages from their consultant
          unreadMessages = await Message.findAll({
            where: {
              beneficiaryId: beneficiaryProfile.id,
              senderId: { [Op.ne]: req.user.id },
              isRead: false
            },
            include: [
              { model: User, as: 'sender' }
            ]
          });
        }
      }

      // Return unread messages data
      return res.json({
        count: unreadMessages.length,
        messages: unreadMessages.map(msg => ({
          id: msg.id,
          subject: msg.subject,
          sender: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
          createdAt: msg.createdAt
        }))
      });
    } catch (error) {
      console.error('Debug unread messages error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
