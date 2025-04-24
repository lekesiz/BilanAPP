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

module.exports = router;
