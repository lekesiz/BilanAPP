const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');
const { ensureAuthenticated } = require('../middlewares/auth');
const { Message, User, Beneficiary } = require('../models');

// Liste des messages pour l'utilisateur connecté
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let messages;

    if (req.user.userType === 'consultant') {
      // Pour les consultants, récupérer les messages avec leurs bénéficiaires
      messages = await Message.findAll({
        where: { consultantId: req.user.id },
        include: [{ model: Beneficiary, as: 'beneficiary' }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Pour les bénéficiaires, trouver leur profil et récupérer leurs messages
      const beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      messages = await Message.findAll({
        where: { beneficiaryId: beneficiary.id },
        include: [{ model: User, as: 'consultant' }],
        order: [['createdAt', 'DESC']],
      });
    }

    res.render('messages/index', {
      title: 'Mes messages',
      messages,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement des messages');
    res.redirect('/dashboard');
  }
});

// Conversation avec un bénéficiaire spécifique (pour consultant)
router.get('/beneficiary/:id', ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.userType !== 'consultant') {
      req.flash('error', 'Accès non autorisé');
      return res.redirect('/dashboard');
    }

    // Vérifier que le bénéficiaire appartient au consultant
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: req.params.id,
        consultantId: req.user.id,
      },
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé ou non autorisé');
      return res.redirect('/messages');
    }

    // Récupérer les messages de la conversation
    const messages = await Message.findAll({
      where: {
        consultantId: req.user.id,
        beneficiaryId: beneficiary.id,
      },
      order: [['createdAt', 'ASC']],
    });

    // Marquer les messages non lus comme lus
    const unreadMessages = messages.filter((m) => !m.isRead && m.senderType !== 'consultant');
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map((message) => message.update({ isRead: true })));
    }

    res.render('messages/conversation', {
      title: `Conversation avec ${beneficiary.firstName} ${beneficiary.lastName}`,
      messages,
      beneficiary,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement de la conversation');
    res.redirect('/messages');
  }
});

// Conversation avec un consultant (pour bénéficiaire)
router.get('/consultant', ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.userType !== 'beneficiary') {
      req.flash('error', 'Accès non autorisé');
      return res.redirect('/dashboard');
    }

    // Trouver le profil bénéficiaire de l'utilisateur
    const beneficiary = await Beneficiary.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'consultant' }],
    });

    if (!beneficiary || !beneficiary.consultant) {
      req.flash('error', 'Consultant non trouvé');
      return res.redirect('/dashboard');
    }

    // Récupérer les messages de la conversation
    const messages = await Message.findAll({
      where: {
        consultantId: beneficiary.consultantId,
        beneficiaryId: beneficiary.id,
      },
      order: [['createdAt', 'ASC']],
    });

    // Marquer les messages non lus comme lus
    const unreadMessages = messages.filter((m) => !m.isRead && m.senderType !== 'beneficiary');
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map((message) => message.update({ isRead: true })));
    }

    res.render('messages/conversation', {
      title: `Conversation avec ${beneficiary.consultant.firstName} ${beneficiary.consultant.lastName}`,
      messages,
      consultant: beneficiary.consultant,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement de la conversation');
    res.redirect('/dashboard');
  }
});

// Envoyer un message (pour consultant)
router.post('/send/beneficiary/:id', ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.userType !== 'consultant') {
      req.flash('error', 'Accès non autorisé');
      return res.redirect('/dashboard');
    }

    const { content } = req.body;

    // Vérifier que le bénéficiaire appartient au consultant
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: req.params.id,
        consultantId: req.user.id,
      },
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé ou non autorisé');
      return res.redirect('/messages');
    }

    // Créer le message
    await Message.create({
      content,
      isRead: false,
      senderType: 'consultant',
      consultantId: req.user.id,
      beneficiaryId: beneficiary.id,
    });

    req.flash('success', 'Message envoyé avec succès');
    res.redirect(`/messages/beneficiary/${beneficiary.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', "Une erreur est survenue lors de l'envoi du message");
    res.redirect('/messages');
  }
});

// Envoyer un message (pour bénéficiaire)
router.post('/send/consultant', ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.userType !== 'beneficiary') {
      req.flash('error', 'Accès non autorisé');
      return res.redirect('/dashboard');
    }

    const { content } = req.body;

    // Trouver le profil bénéficiaire de l'utilisateur
    const beneficiary = await Beneficiary.findOne({
      where: { userId: req.user.id },
    });

    if (!beneficiary || !beneficiary.consultantId) {
      req.flash('error', 'Consultant non trouvé');
      return res.redirect('/dashboard');
    }

    // Créer le message
    await Message.create({
      content,
      isRead: false,
      senderType: 'beneficiary',
      consultantId: beneficiary.consultantId,
      beneficiaryId: beneficiary.id,
    });

    req.flash('success', 'Message envoyé avec succès');
    res.redirect('/messages/consultant');
  } catch (err) {
    console.error(err);
    req.flash('error', "Une erreur est survenue lors de l'envoi du message");
    res.redirect('/dashboard');
  }
});

module.exports = router;
