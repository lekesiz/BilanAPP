const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
const { Message, Beneficiary, User } = require('../models');
const { Op } = require('sequelize');

// Liste des conversations
router.get('/', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    try {
        let conversations = [];
        let participants = []; // Filtreleme için
        const userId = req.user.id;
        const userType = req.user.userType;

        if (userType === 'consultant') {
            // Danışman tüm yararlanıcıları ile olan son mesajları alır
            const beneficiaries = await Beneficiary.findAll({
                where: { consultantId: userId },
                include: { model: User, as: 'user' }
            });
            participants = beneficiaries; // Filtre için

            for (const beneficiary of beneficiaries) {
                const lastMessage = await Message.findOne({
                    where: {
                        [Op.or]: [
                            { consultantId: userId, beneficiaryId: beneficiary.id },
                            { consultantId: userId, senderId: beneficiary.userId }, // Yararlanıcı gönderdiyse
                            { beneficiaryId: beneficiary.id, senderId: userId }     // Danışman gönderdiyse
                        ]
                    },
                    order: [['createdAt', 'DESC']],
                    include: [
                        { model: User, as: 'sender', attributes: ['firstName', 'lastName', 'userType'] },
                        { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } }
                    ]
                });
                if (lastMessage) {
                    conversations.push({
                        participant: beneficiary,
                        lastMessage: lastMessage,
                        isRead: (lastMessage.senderId === userId || lastMessage.isRead) // Kendi gönderdiği veya okunduysa
                    });
                }
            }
        } else {
            // Yararlanıcı sadece danışmanı ile olan son mesajı alır
            const beneficiaryProfile = await Beneficiary.findOne({
                where: { userId: userId },
                include: { model: User, as: 'consultant' }
            });
            participants.push(beneficiaryProfile.consultant); // Filtre için (tek eleman)

            if (beneficiaryProfile) {
                const lastMessage = await Message.findOne({
                    where: {
                        [Op.or]: [
                            { consultantId: beneficiaryProfile.consultantId, beneficiaryId: beneficiaryProfile.id },
                            { consultantId: beneficiaryProfile.consultantId, senderId: userId }, // Yararlanıcı gönderdiyse
                            { beneficiaryId: beneficiaryProfile.id, senderId: beneficiaryProfile.consultantId } // Danışman gönderdiyse
                        ]
                    },
                    order: [['createdAt', 'DESC']],
                     include: [
                        { model: User, as: 'sender', attributes: ['firstName', 'lastName', 'userType'] },
                        { model: User, as: 'consultant' } // Danışmanı include et
                    ]
                });
                 if (lastMessage) {
                     conversations.push({
                        participant: { user: lastMessage.consultant }, // Danışman bilgisini participant olarak ata
                        lastMessage: lastMessage,
                        isRead: (lastMessage.senderId === userId || lastMessage.isRead)
                    });
                }
            }
        }
        
        // Konuşmaları son mesaja göre sırala
        conversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

        res.render('messages/index', {
            title: 'Mes Messages',
            conversations,
            participants, // Filtreleme için (şu an kullanılmıyor)
            user: req.user,
            isConsultant: userType === 'consultant'
        });

    } catch (err) {
        console.error('Messages list error:', err);
        req.flash('error_msg', 'Mesajlar yüklenirken bir hata oluştu.');
        res.redirect('/dashboard');
    }
});


// Formulaire pour envoyer un nouveau message
router.get('/new', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  try {
    let recipients = [];
    let preselectedRecipient = req.query.beneficiary || req.query.consultant;
    let recipientType = '';

    if (req.user.userType === 'consultant') {
      recipientType = 'beneficiary';
      recipients = await Beneficiary.findAll({
        where: { consultantId: req.user.id },
        include: { model: User, as: 'user' }
      });
    } else {
      // Yararlanıcı sadece danışmanına mesaj gönderebilir
      recipientType = 'consultant';
      const beneficiaryProfile = await Beneficiary.findOne({ 
          where: { userId: req.user.id },
          include: { model: User, as: 'consultant' }
       });
      if (beneficiaryProfile && beneficiaryProfile.consultant) {
          recipients.push(beneficiaryProfile.consultant); // Danışmanı listeye ekle
          preselectedRecipient = beneficiaryProfile.consultantId; // ID'sini önceden seç
      } else {
          req.flash('error_msg', 'Danışmanınız bulunamadı.');
          return res.redirect('/messages');
      }
    }
    
    res.render('messages/new', {
      title: 'Nouveau Message',
      user: req.user,
      recipients,
      preselectedRecipient,
      recipientType,
      isConsultant: req.user.userType === 'consultant'
    });

  } catch (error) {
      console.error('New message form error:', error);
      req.flash('error_msg', 'Mesaj formu yüklenirken bir hata oluştu.');
      res.redirect('/messages');
  }
});

// Traitement de l'envoi d'un nouveau message
router.post('/new', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  const { recipientId, subject, body } = req.body;
  const senderId = req.user.id;

  try {
    let consultantId, beneficiaryId;

    if (req.user.userType === 'consultant') {
      consultantId = senderId;
      beneficiaryId = recipientId;
      // Danışman seçilen yararlanıcının kendine ait olduğunu doğrulamalı
      const isOwnBeneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: consultantId }});
      if (!isOwnBeneficiary) {
        req.flash('error_msg', 'Geçersiz alıcı seçimi.');
        return res.redirect('/messages/new');
      }
    } else {
      // Yararlanıcı gönderiyor, alıcı danışman olmalı
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: senderId } });
      if (!beneficiaryProfile) {
          req.flash('error_msg', 'Profiliniz bulunamadı.');
          return res.redirect('/messages');
      }
      consultantId = recipientId;
      beneficiaryId = beneficiaryProfile.id;
      // Alıcının gerçekten danışmanı olduğunu doğrula
      if (beneficiaryProfile.consultantId.toString() !== consultantId) {
          req.flash('error_msg', 'Geçersiz alıcı.');
          return res.redirect('/messages/new');
      }
    }

    await Message.create({
      senderId,
      consultantId,
      beneficiaryId,
      subject,
      body,
      isRead: false // Yeni mesaj okunmadı olarak işaretlenir
    });

    req.flash('success_msg', 'Message envoyé avec succès.');
    res.redirect('/messages');

  } catch (err) {
    console.error('Send message error:', err);
    req.flash('error_msg', 'Une erreur est survenue lors de l\'envoi du message.');
    res.redirect('/messages/new'); 
  }
});

// Marquer un message comme lu (AJAX endpoint olabilir)
// router.post('/:id/read', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => { ... });

// Supprimer un message (genellikle önerilmez, konuşmayı silmek daha iyi olabilir)
// router.post('/:id/delete', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => { ... });

module.exports = router;
