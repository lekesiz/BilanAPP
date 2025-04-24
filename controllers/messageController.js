const { Op } = require('sequelize');
const { Message, Beneficiary, User } = require('../models');
const sequelize = require('../config/database'); // Required for literal subquery

// GET / - List conversations
exports.listConversations = async (req, res) => {
  try {
    let conversations = [];
    let participants = []; // For filter dropdown
    const userId = req.user.id;
    const { userType } = req.user;
    const isAdmin = req.user.forfaitType === 'Admin';

    if (isAdmin) {
      req.flash('info_msg', 'Admin message view is not yet implemented.');
      return res.render('messages/index', {
        title: 'Messages (Admin)',
        conversations: [],
        user: req.user,
        isAdmin: true,
      });
    }
    if (userType === 'consultant') {
      // Optimized query for consultant conversations
      const beneficiaries = await Beneficiary.findAll({
        where: { consultantId: userId },
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      participants = beneficiaries;
      const beneficiaryIds = beneficiaries.map((b) => b.id);

      if (beneficiaryIds.length > 0) {
        const latestMessageSubQuery = `(
                    SELECT MAX(id) 
                    FROM Messages AS m 
                    WHERE m.consultantId = ${sequelize.escape(userId)} 
                      AND m.beneficiaryId IN (${beneficiaryIds.map((id) => sequelize.escape(id)).join(',')}) 
                    GROUP BY m.beneficiaryId
                )`;
        const lastMessages = await Message.findAll({
          where: { id: { [Op.in]: sequelize.literal(latestMessageSubQuery) } },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'userType'],
            },
            {
              model: Beneficiary,
              as: 'beneficiary',
              include: { model: User, as: 'user' },
            },
          ],
          order: [['createdAt', 'DESC']],
        });
        const beneficiaryMap = new Map(beneficiaries.map((b) => [b.id, b]));
        conversations = lastMessages.map((msg) => ({
          participant: beneficiaryMap.get(msg.beneficiaryId),
          lastMessage: msg,
          isRead: msg.senderId === userId || msg.isRead,
        }));
      }
    } else {
      // userType === 'beneficiary'
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId },
        include: { model: User, as: 'consultant' },
      });
      if (!beneficiaryProfile || !beneficiaryProfile.consultant) {
        req.flash('error_msg', 'Consultant profile not found.');
        return res.redirect('/dashboard');
      }
      participants.push(beneficiaryProfile.consultant);
      const lastMessage = await Message.findOne({
        where: {
          consultantId: beneficiaryProfile.consultantId,
          beneficiaryId: beneficiaryProfile.id,
        }, // Simplified where for point-to-point
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['firstName', 'lastName', 'userType'],
          },
          { model: User, as: 'consultant' }, // Use the consultant from beneficiaryProfile
        ],
      });
      if (lastMessage) {
        conversations.push({
          participant: { user: beneficiaryProfile.consultant }, // Get consultant info directly
          lastMessage,
          isRead: lastMessage.senderId === userId || lastMessage.isRead,
        });
      }
    }

    conversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    const plainConversations = conversations.map((conv) => ({
      participant: conv.participant.get ? conv.participant.get({ plain: true }) : conv.participant,
      lastMessage: conv.lastMessage.get({ plain: true }),
      isRead: conv.isRead,
    }));
    const plainParticipants = participants.map((p) => (p.get ? p.get({ plain: true }) : p));

    res.render('messages/index', {
      title: 'Mes Messages',
      conversations: plainConversations,
      participants: plainParticipants,
      user: req.user,
      isConsultant: userType === 'consultant',
    });
  } catch (err) {
    console.error('Messages list error:', err);
    req.flash('error_msg', 'Erreur lors du chargement des messages.');
    res.redirect('/dashboard');
  }
};

// GET /messages/new - Show new message form
exports.showNewMessageForm = async (req, res) => {
  let preselectedRecipient = req.query.recipient;
  try {
    // console.log('[DEBUG] /messages/new - user:', req.user.id, 'userType:', req.user.userType, 'forfaitType:', req.user.forfaitType);
    // console.log('[DEBUG] /messages/new - preselectedRecipient:', preselectedRecipient);

    let recipients = [];
    let recipientType = '';
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';

    if (isAdmin || isConsultant) {
      recipientType = 'beneficiary';
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      if (preselectedRecipient) {
        whereCondition.id = preselectedRecipient;
      }
      // console.log('[DEBUG] /messages/new - Loading beneficiaries with whereCondition:', whereCondition);

      try {
        const rawRecipients = await User.findAll({
          where: whereCondition,
          order: [
            ['lastName', 'ASC'],
            ['firstName', 'ASC'],
          ],
        });

        // console.log('[DEBUG] /messages/new - Loaded', rawRecipients.length, 'beneficiaries');

        if (rawRecipients && rawRecipients.length > 0) {
          recipients = rawRecipients.map((u) => u.get({ plain: true }));
        } else {
          // console.log('[DEBUG] /messages/new - No beneficiaries found for this consultant');
          // Potentially handle this case - maybe disable recipient selection or show a message
        }

        // If a specific recipient is requested, fetch their details for potential context
        if (preselectedRecipient) {
          const beneficiaryProfile = rawRecipients
            .find((u) => u.id == preselectedRecipient)
            ?.get({ plain: true });
          // console.log('[DEBUG] /messages/new - Loaded beneficiary profile:', beneficiaryProfile?.id || 'Not found');
        }
      } catch (beneficiaryLoadError) {
        console.error('[ERROR] /messages/new - Error loading beneficiaries:', beneficiaryLoadError);
        req.flash('warning_msg', 'Certains bénéficiaires peuvent ne pas être affichés.');
      }
    } else if (req.user.userType === 'Beneficiary') {
      // Beneficiary can only message their assigned consultant
      recipientType = 'consultant';
      try {
        const beneficiaryProfile = await Beneficiary.findOne({
          where: { userId: req.user.id },
          include: { model: User, as: 'consultant' },
        });

        // console.log('[DEBUG] /messages/new - Loaded beneficiary profile:', beneficiaryProfile?.id || 'Not found');

        if (beneficiaryProfile?.consultant) {
          try {
            recipients.push(beneficiaryProfile.consultant.get({ plain: true })); // Send plain object
            preselectedRecipient = beneficiaryProfile.consultantId;
          } catch (plainError) {
            console.error(
              '[ERROR] /messages/new - Error converting consultant to plain object:',
              plainError,
            );
            recipients.push(beneficiaryProfile.consultant);
            preselectedRecipient = beneficiaryProfile.consultantId;
          }
        } else {
          console.error(
            '[ERROR] /messages/new - Consultant not found for beneficiary:',
            req.user.id,
          );
          req.flash('error_msg', 'Consultant non trouvé.');
          return res.redirect('/messages');
        }
      } catch (consultantLoadError) {
        console.error(
          '[ERROR] /messages/new - Error loading consultant for beneficiary:',
          consultantLoadError,
        );
        req.flash('error_msg', 'Erreur lors du chargement du consultant.');
        return res.redirect('/messages');
      }
    }

    res.render('messages/new', {
      title: 'Nouveau Message',
      user: req.user,
      recipients,
      preselectedRecipient,
      recipientType,
      isConsultant: req.user.userType === 'consultant',
    });
  } catch (error) {
    console.error('New message form error:', error);
    req.flash('error_msg', 'Erreur chargement formulaire message.');
    res.redirect('/messages');
  }
};

// POST /messages/new - Send a new message
exports.sendMessage = async (req, res) => {
  const { recipientId, subject, body } = req.body;
  const senderId = req.user.id;

  try {
    let consultantId;
    let beneficiaryId;

    if (req.user.userType === 'consultant') {
      consultantId = senderId;
      beneficiaryId = recipientId;
      const isOwnBeneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, consultantId },
      });
      if (!isOwnBeneficiary) {
        req.flash('error_msg', 'Destinataire invalide.');
        return res.redirect('/messages/new');
      }
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: senderId },
      });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil non trouvé.');
        return res.redirect('/messages');
      }
      consultantId = recipientId;
      beneficiaryId = beneficiaryProfile.id;
      if (beneficiaryProfile.consultantId.toString() !== consultantId) {
        req.flash('error_msg', 'Destinataire invalide (consultant incorrect).');
        return res.redirect('/messages/new');
      }
    }

    await Message.create({
      senderId,
      consultantId,
      beneficiaryId,
      subject,
      body,
      isRead: false,
    });

    req.flash('success_msg', 'Message envoyé.');
    res.redirect('/messages');
  } catch (err) {
    console.error('Send message error:', err);
    req.flash('error_msg', "Erreur lors de l'envoi du message.");
    res.redirect('/messages/new');
  }
};

// GET /messages/conversation/:participantId - View a conversation
exports.showConversation = async (req, res) => {
  const otherParticipantId = req.params.participantId;
  const userId = req.user.id;
  const { userType } = req.user;
  const isAdmin = req.user.forfaitType === 'Admin';

  if (isAdmin) {
    // TODO: Implement Admin conversation view logic
    req.flash('error_msg', 'Admin conversation view is not yet supported.');
    return res.redirect('/messages');
  }

  try {
    let consultantId;
    let beneficiaryId;
    let participantUser; // The other user in the conversation

    if (userType === 'consultant') {
      consultantId = userId;
      beneficiaryId = otherParticipantId;
      const beneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, consultantId },
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      });
      if (!beneficiary) {
        req.flash('error_msg', 'Conversation non trouvée ou accès non autorisé.');
        return res.redirect('/messages');
      }
      participantUser = beneficiary.user.get({ plain: true });
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId },
        attributes: ['id', 'consultantId'],
      });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil non trouvé.');
        return res.redirect('/dashboard');
      }
      beneficiaryId = beneficiaryProfile.id;
      consultantId = otherParticipantId;
      if (beneficiaryProfile.consultantId.toString() !== consultantId) {
        req.flash('error_msg', 'Conversation non trouvée ou accès non autorisé.');
        return res.redirect('/messages');
      }
      participantUser = await User.findByPk(consultantId, {
        attributes: ['id', 'firstName', 'lastName', 'email'],
        plain: true,
      });
      if (!participantUser) {
        req.flash('error_msg', 'Consultant non trouvé.');
        return res.redirect('/messages');
      }
    }

    const messagesRaw = await Message.findAll({
      where: { consultantId, beneficiaryId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'userType'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
    const messages = messagesRaw.map((m) => m.get({ plain: true }));

    // TODO: Mark messages as read
    // await Message.update({ isRead: true }, { where: { consultantId, beneficiaryId, senderId: { [Op.ne]: userId }, isRead: false } });

    const whereCondition = { consultantId, beneficiaryId };

    // Mark messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          consultantId,
          beneficiaryId,
          senderId: { [Op.ne]: userId }, // Okunmamış ve gönderen ben değilsem
          isRead: false,
        },
      },
    );

    res.render('messages/conversation', {
      title: `Conversation avec ${participantUser.firstName} ${participantUser.lastName}`,
      messages,
      participant: participantUser,
      user: req.user,
      isConsultant: userType === 'consultant',
    });
  } catch (err) {
    console.error('Conversation load error:', err);
    req.flash('error_msg', 'Erreur lors du chargement de la conversation.');
    res.redirect('/messages');
  }
};
