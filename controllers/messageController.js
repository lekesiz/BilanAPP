const { Op } = require('sequelize');
const { Message, Beneficiary, User, Conversation, Consultant } = require('../models');
const sequelize = require('../config/database'); // Required for literal subquery
const logger = require('../config/logger'); // Assuming you have a logger configured
const db = require('../models'); // Added for db references
const { validationResult } = require('express-validator');

// GET /messages - List conversations
exports.listConversations = async (req, res) => {
  try {
    const { user } = req;
    const isAdmin = user.role === 'admin';
    const isConsultant = user.role === 'consultant';
    const isBeneficiary = user.role === 'beneficiary';
    
    let conversations = [];

    if (isAdmin) {
      // Admin sees all conversations
      conversations = await Conversation.findAll({
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
          },
          {
            model: User,
            as: 'participants',
          }
        ],
        order: [['updatedAt', 'DESC']],
      });

      // Format conversations for display
      conversations = conversations.map(conv => {
        const lastMessage = conv.messages[0];
        // Find a participant who is not the admin
        const participant = conv.participants.find(p => p.id !== user.id) || conv.participants[0];
        
        return {
          id: conv.id,
          lastMessage,
          isRead: lastMessage ? lastMessage.isRead : true,
          participant,
        };
      });
    } else if (isConsultant) {
      // Get consultant profile
      const consultantProfile = await Consultant.findOne({
        where: { userId: user.id },
        include: [{ model: User, as: 'user' }]
      });

      if (!consultantProfile) {
        throw new Error('Consultant profile not found');
      }

      // Get all beneficiaries assigned to this consultant
      const beneficiaries = await Beneficiary.findAll({
        where: { consultantId: consultantProfile.id },
        include: [{ model: User, as: 'user' }]
      });

      // Get conversations for each beneficiary
      conversations = await Promise.all(
        beneficiaries.map(async (beneficiary) => {
          const conversation = await Conversation.findOne({
            where: {
              [Op.or]: [
                { '$participants.id$': user.id },
                { '$participants.id$': beneficiary.userId }
              ]
            },
            include: [
              {
                model: Message,
                as: 'messages',
                limit: 1,
                order: [['createdAt', 'DESC']],
              },
              {
                model: User,
                as: 'participants',
              }
            ],
            order: [['updatedAt', 'DESC']],
          });

          if (!conversation) {
            // Create a placeholder for beneficiaries without conversations
            return {
              id: `new-${beneficiary.id}`, // Special ID to indicate new conversation
              participant: beneficiary.user,
              lastMessage: { 
                content: 'Aucun message', 
                createdAt: new Date(), 
                isRead: true 
              },
              isRead: true,
              isBeneficiary: true,
              beneficiaryId: beneficiary.id
            };
          }

          const lastMessage = conversation.messages[0];
          
          return {
            id: conversation.id,
            lastMessage,
            isRead: lastMessage ? lastMessage.isRead || lastMessage.senderId === user.id : true,
            participant: beneficiary.user,
            isBeneficiary: true,
            beneficiaryId: beneficiary.id
          };
        })
      );

      // Filter out null values (beneficiaries without conversations)
      conversations = conversations.filter(Boolean);
    } else if (isBeneficiary) {
      // Get beneficiary profile
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: user.id },
        include: [
          { model: User, as: 'user' },
          { 
            model: Consultant, 
            as: 'consultant',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });

      if (!beneficiaryProfile) {
        throw new Error('Beneficiary profile not found');
      }

      if (!beneficiaryProfile.consultant) {
        // No consultant assigned
        return res.render('messages/index', { 
          title: 'Messages',
          conversations: [],
          isBeneficiary: true
        });
      }

      // Get conversation with consultant
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { '$participants.id$': user.id },
            { '$participants.id$': beneficiaryProfile.consultant.userId }
          ]
        },
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
          },
          {
            model: User,
            as: 'participants',
          }
        ],
      });

      if (conversation) {
        const lastMessage = conversation.messages[0];
        conversations = [{
          id: conversation.id,
          lastMessage,
          isRead: lastMessage ? lastMessage.isRead || lastMessage.senderId === user.id : true,
          participant: beneficiaryProfile.consultant.user
        }];
      } else {
        // No conversation yet but show consultant
        conversations = [{
          id: `new-${beneficiaryProfile.consultant.id}`, // Special ID to indicate new conversation
          participant: beneficiaryProfile.consultant.user,
          lastMessage: { 
            content: 'Aucun message', 
            createdAt: new Date(), 
            isRead: true 
          },
          isRead: true
        }];
      }
    }

    // Render the messages index view
    res.render('messages/index', {
      title: 'Messages',
      conversations,
      isAdmin,
      isConsultant,
      isBeneficiary
    });
  } catch (error) {
    console.error('Messages list error:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement des messages.');
    return res.redirect('/dashboard');
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

      try {
        // Corrected Query: Fetch Beneficiary including User
        const rawRecipients = await Beneficiary.findAll({
          where: whereCondition,
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName'], // Select needed attributes
          },
          order: [
            // Order by associated User's name
            [{ model: User, as: 'user' }, 'lastName', 'ASC'],
            [{ model: User, as: 'user' }, 'firstName', 'ASC'],
          ],
        });

        if (rawRecipients && rawRecipients.length > 0) {
          // Map Beneficiary objects (which include user details)
          recipients = rawRecipients.map((b) => b.get({ plain: true }));
        } else {
          // console.log('[DEBUG] /messages/new - No beneficiaries found for this consultant');
        }

        // If a specific recipient is requested via query param, ensure it exists in the fetched list
        if (req.query.recipient) { 
          const requestedId = parseInt(req.query.recipient, 10);
          const exists = recipients.some(r => r.id === requestedId);
          if (exists) {
            preselectedRecipient = requestedId;
          } else {
             logger.warn(`[Messages] Preselected recipient ID ${requestedId} not found or not valid for user ${req.user.id}`);
             // Don't preselect if invalid
             preselectedRecipient = null; 
          }
        }
      } catch (beneficiaryLoadError) {
        console.error(
            '[ERROR] /messages/new - Error loading beneficiaries:', 
            beneficiaryLoadError
        );
        req.flash('warning_msg', 'Certains bénéficiaires peuvent ne pas être affichés.');
      }
    } else if (req.user.userType === 'beneficiary') {
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
  const { recipientId, subject, content } = req.body;
  const senderId = req.user.id;
  const isAdmin = req.user.forfaitType === 'Admin';

  logger.info('[CONTROLLER] sendMessage - Received:', { recipientId, subject: subject?.substring(0, 20), senderId, isAdmin });

  try {
    let targetUser;
    let consultantId;
    let beneficiaryId;
    let targetBeneficiary = null;

    // Find or determine the recipient user
    if (req.user.userType === 'beneficiary') {
      // Beneficiary sending to consultant
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: senderId } });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil bénéficiaire non trouvé.');
        return res.redirect('/messages');
      }
      
      // Ensure the consultant ID matches the assigned consultant
      if (beneficiaryProfile.consultantId.toString() !== recipientId) {
        req.flash('error_msg', 'Destinataire invalide (consultant incorrect).');
        return res.redirect('/messages/new');
      }
      
      targetUser = await User.findByPk(recipientId);
      consultantId = targetUser.id;
      beneficiaryId = beneficiaryProfile.id;
    } else if (req.user.userType === 'consultant' || isAdmin) {
      // Consultant or Admin sending to beneficiary
      targetBeneficiary = await Beneficiary.findByPk(recipientId);
      if (!targetBeneficiary) {
        req.flash('error_msg', 'Bénéficiaire non trouvé.');
        return res.redirect('/messages/new');
      }
      
      // For consultants, verify the beneficiary belongs to them
      if (req.user.userType === 'consultant' && targetBeneficiary.consultantId !== senderId) {
        req.flash('error_msg', 'Ce bénéficiaire n\'est pas assigné à votre compte.');
        return res.redirect('/messages/new');
      }
      
      targetUser = await User.findByPk(targetBeneficiary.userId);
      consultantId = req.user.userType === 'consultant' ? senderId : targetBeneficiary.consultantId;
      beneficiaryId = targetBeneficiary.id;
    }

    if (!targetUser) {
      req.flash('error_msg', 'Destinataire non trouvé.');
      return res.redirect('/messages/new');
    }

    // Create message
    await Message.create({
      senderId,
      subject,
      body: content, // Use body instead of content for database compatibility
      isRead: false,
      consultantId,
      beneficiaryId
    });

    req.flash('success_msg', 'Message envoyé.');
    res.redirect('/messages');
  } catch (err) {
    console.error('Send message error:', err);
    req.flash('error_msg', "Erreur lors de l'envoi du message.");
    res.redirect('/messages/new');
  }
};

// GET /messages/conversation/:id - View a conversation
exports.showConversation = async (req, res) => {
  try {
    const { id } = req.params; // This is the participant ID (beneficiary for consultants, consultant for beneficiaries)
    const userType = req.user.userType.toLowerCase();
    const isAdmin = userType === 'admin';
    
    // Validate ID parameter
    if (!id) {
      logger.error(`[CONVERSATION] Missing required ID parameter`);
      req.flash('error_msg', 'Identifiant de conversation manquant');
      return res.redirect('/messages');
    }
    
    logger.info(`[CONVERSATION] Viewing conversation. ID: ${id}, UserType: ${userType}, isAdmin: ${isAdmin}`);
    
    let participant, participantUser, messages;
    
    if (userType === 'consultant') {
      // Consultant is viewing conversation with a beneficiary
      logger.info(`[CONVERSATION] Consultant (${req.user.id}) viewing conversation with beneficiary ID ${id}`);
      
      // Find beneficiary with a safer findByPk method
      const beneficiary = await Beneficiary.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });
      
      if (!beneficiary) {
        logger.error(`[CONVERSATION] Beneficiary with ID ${id} not found`);
        req.flash('error_msg', 'Bénéficiaire introuvable');
        return res.redirect('/messages');
      }
      
      // Ensure beneficiary has a user associated
      if (!beneficiary.user) {
        logger.error(`[CONVERSATION] Beneficiary ${id} has no associated user`);
        req.flash('error_msg', 'Profil utilisateur du bénéficiaire introuvable');
        return res.redirect('/messages');
      }
      
      // Verify this beneficiary belongs to this consultant
      if (beneficiary.consultantId !== req.user.id && userType !== 'admin') {
        logger.error(`[CONVERSATION] Consultant ${req.user.id} is not authorized to view beneficiary ${id}`);
        req.flash('error_msg', 'Vous n\'êtes pas autorisé à accéder à cette conversation');
        return res.redirect('/messages');
      }
      
      participant = beneficiary;
      participantUser = beneficiary.user;
      
      // Get messages between this consultant and beneficiary
      messages = await Message.findAll({
        where: { 
          beneficiaryId: beneficiary.id
        },
        order: [['createdAt', 'ASC']],
        include: [
          { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'userType'] }
        ]
      });
      
      logger.info(`[CONVERSATION] Found ${messages.length} messages for beneficiary ${beneficiary.id}. First message: ${messages.length > 0 ? JSON.stringify({id: messages[0].id, body: messages[0].body, senderId: messages[0].senderId}) : 'None'}`);
      
    } else if (userType === 'beneficiary') {
      // Beneficiary is viewing conversation with their consultant
      logger.info(`[CONVERSATION] Beneficiary (${req.user.id}) viewing conversation with consultant ID ${id}`);
      
      // Find the beneficiary profile for the current user
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id }
      });
      
      if (!beneficiaryProfile) {
        logger.error(`[CONVERSATION] Beneficiary profile for user ${req.user.id} not found`);
        req.flash('error_msg', 'Profil bénéficiaire introuvable');
        return res.redirect('/messages');
      }
      
      // Verify the consultant ID matches
      if (beneficiaryProfile.consultantId.toString() !== id && userType !== 'admin') {
        logger.error(`[CONVERSATION] Consultant ${id} is not assigned to beneficiary ${beneficiaryProfile.id}`);
        req.flash('error_msg', 'Vous n\'êtes pas autorisé à accéder à cette conversation');
        return res.redirect('/messages');
      }
      
      // Find consultant
      const consultant = await User.findByPk(id);
      
      if (!consultant) {
        logger.error(`[CONVERSATION] Consultant with ID ${id} not found`);
        req.flash('error_msg', 'Consultant introuvable');
        return res.redirect('/messages');
      }
      
      participant = consultant;
      participantUser = consultant;
      
      // Get messages between this beneficiary and their consultant
      messages = await Message.findAll({
        where: { 
          beneficiaryId: beneficiaryProfile.id
        },
        order: [['createdAt', 'ASC']],
        include: [
          { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'userType'] }
        ]
      });
      
      logger.info(`[CONVERSATION] Found ${messages.length} messages for beneficiary ${beneficiaryProfile.id}. First message: ${messages.length > 0 ? JSON.stringify({id: messages[0].id, body: messages[0].body, senderId: messages[0].senderId}) : 'None'}`);
    } else if (isAdmin) {
      // Admin is viewing a conversation
      const beneficiary = await Beneficiary.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });
      
      if (!beneficiary) {
        logger.error(`[CONVERSATION] Admin view: Beneficiary with ID ${id} not found`);
        req.flash('error_msg', 'Bénéficiaire introuvable');
        return res.redirect('/messages');
      }
      
      participant = beneficiary;
      participantUser = beneficiary.user;
      
      messages = await Message.findAll({
        where: { 
          beneficiaryId: beneficiary.id
        },
        order: [['createdAt', 'ASC']],
        include: [
          { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'userType'] }
        ]
      });
    } else {
      req.flash('error_msg', 'Type d\'utilisateur non reconnu');
      return res.redirect('/messages');
    }
    
    // If no messages found, initialize an empty array
    if (!messages || messages.length === 0) {
      logger.info(`[CONVERSATION] No messages found for conversation with ID ${id}`);
      messages = [];
    }
    
    // Mark messages as read if not already
    if (!isAdmin && messages.length > 0) {
      const updateResult = await Message.update(
        { isRead: true, readAt: new Date() },
        { 
          where: { 
            senderId: { [Op.ne]: req.user.id },
            isRead: false,
            beneficiaryId: userType === 'beneficiary' 
              ? messages[0].beneficiaryId 
              : participant.id
          } 
        }
      );
      logger.info(`[CONVERSATION] Marked ${updateResult[0]} messages as read`);
    }
    
    // Render the conversation view
    return res.render('messages/conversation', {
      title: `Conversation avec ${participantUser.firstName} ${participantUser.lastName}`,
      messages,
      participant: participantUser,
      userType,
      isAdmin,
      isConsultant: userType === 'consultant',
      isBeneficiary: userType === 'beneficiary'
    });
    
  } catch (error) {
    logger.error(`[CONVERSATION] Error showing conversation: ${error.message}`, { stack: error.stack });
    req.flash('error_msg', 'Erreur lors de l\'affichage de la conversation');
    return res.redirect('/messages');
  }
};
