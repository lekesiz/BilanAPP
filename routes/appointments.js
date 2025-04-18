const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
const { Appointment, Beneficiary, User } = require('../models');
const { Op } = require('sequelize');

// Liste des rendez-vous
router.get('/', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  try {
    let whereClause = {};
    const queryOptions = {
      include: [
        { model: User, as: 'consultant', attributes: ['id', 'firstName', 'lastName'] },
        { 
          model: Beneficiary, 
          as: 'beneficiary', 
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }]
        }
      ],
      order: [['date', 'DESC']] 
    };

    const userType = req.user.userType;
    const userId = req.user.id;
    const filter = req.query.filter; // Get filter from query
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (userType === 'consultant') {
      whereClause.consultantId = userId;
      if (req.query.beneficiary) {
        whereClause.beneficiaryId = req.query.beneficiary;
      }
    } else {
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: userId } });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profiliniz bulunamadı.');
        return res.redirect('/dashboard');
      }
      whereClause.beneficiaryId = beneficiaryProfile.id;
    }
    
    // Apply date filter if present
    if (filter === 'upcoming_7days') {
        whereClause.status = 'scheduled'; // Only scheduled
        whereClause.date = {
            [Op.gte]: today,
            [Op.lte]: next7Days
        };
         queryOptions.order = [['date', 'ASC']]; // Order by upcoming date
    }
    
    queryOptions.where = whereClause;

    const appointments = await Appointment.findAll(queryOptions);
    
    // Eğer danışman ise ve filtreleme için yararlanıcı listesi gerekiyorsa
    let beneficiaries = [];
    if (userType === 'consultant') {
      beneficiaries = await Beneficiary.findAll({
        where: { consultantId: userId },
        include: { model: User, as: 'user' }
      });
    }

    res.render('appointments/index', {
      title: 'Mes Rendez-vous',
      appointments,
      beneficiaries, // Danışman için filtreleme
      selectedBeneficiary: req.query.beneficiary, // Seçili filtre değeri
      user: req.user,
      isConsultant: userType === 'consultant',
      activeFilter: filter // Pass active filter to view
    });
  } catch (err) {
    console.error('Appointments list error:', err);
    req.flash('error_msg', 'Randevular yüklenirken bir hata oluştu.');
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout de rendez-vous
router.get('/new', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  try {
    let beneficiaries = [];
    let preselectedBeneficiary = req.query.beneficiary;

    if (req.user.userType === 'consultant') {
      beneficiaries = await Beneficiary.findAll({
        where: { consultantId: req.user.id },
        include: { model: User, as: 'user' }
      });
    } else {
      // Yararlanıcı kendi için randevu oluşturuyor, sadece kendi ID'sini kullan
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
      if (!beneficiaryProfile) {
         req.flash('error_msg', 'Profiliniz bulunamadı.');
         return res.redirect('/appointments');
      }
      preselectedBeneficiary = beneficiaryProfile.id;
      // Yararlanıcının danışmanını bul
      const consultant = await User.findByPk(beneficiaryProfile.consultantId);
      // Yararlanıcılar listesine sadece kendini ve danışmanını ekle (gerekirse)
      // Bu kısım view'da yararlanıcı seçimi gerekmiyorsa kaldırılabilir
    }

    res.render('appointments/new', {
      title: 'Planifier un rendez-vous',
      user: req.user,
      beneficiaries, // Danışman için yararlanıcı listesi
      preselectedBeneficiary, // Önceden seçili yararlanıcı (varsa)
      isConsultant: req.user.userType === 'consultant'
    });
  } catch (error) {
     console.error('New appointment form error:', error);
     req.flash('error_msg', 'Randevu formu yüklenirken bir hata oluştu.');
     res.redirect('/appointments');
  }
});

// Traitement du formulaire d'ajout
router.post('/new', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  const { beneficiaryId, date, time, type, description, location, notes } = req.body;
  const dateTime = `${date} ${time}`; // Tarih ve saati birleştir

  try {
    let consultantId;
    let finalBeneficiaryId = beneficiaryId;

    if (req.user.userType === 'consultant') {
      consultantId = req.user.id;
      // Danışman seçilen yararlanıcının gerçekten kendine ait olup olmadığını kontrol etmeli
      const isOwnBeneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: req.user.id } });
      if (!isOwnBeneficiary) {
        req.flash('error_msg', 'Geçersiz yararlanıcı seçimi.');
        return res.redirect('/appointments/new');
      }
    } else {
      // Yararlanıcı kendi için oluşturuyor
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
       if (!beneficiaryProfile) {
         req.flash('error_msg', 'Profiliniz bulunamadı.');
         return res.redirect('/appointments');
      }
      consultantId = beneficiaryProfile.consultantId;
      finalBeneficiaryId = beneficiaryProfile.id;
    }

    await Appointment.create({
      consultantId,
      beneficiaryId: finalBeneficiaryId,
      date: dateTime,
      type,
      description,
      location,
      notes,
      status: 'scheduled'
    });

    req.flash('success_msg', 'Rendez-vous planifié avec succès.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment add error:', err);
    req.flash('error_msg', 'Une erreur est survenue lors de la planification du rendez-vous.');
    // Hata durumunda formu tekrar render et, girilen değerleri geri gönder
    // ... (Bu kısım eklenebilir)
    res.redirect('/appointments/new'); 
  }
});

// Formulaire de modification de rendez-vous
router.get('/:id/edit', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
       include: [
        { model: User, as: 'consultant', attributes: ['id', 'firstName', 'lastName'] },
        { 
          model: Beneficiary, 
          as: 'beneficiary', 
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }]
        }
      ]
    });

    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    // Yetki kontrolü: Danışman veya ilgili yararlanıcı mı?
    const isOwner = (req.user.userType === 'consultant' && appointment.consultantId === req.user.id) ||
                    (req.user.userType === 'beneficiary' && appointment.beneficiary.userId === req.user.id);

    if (!isOwner) {
      req.flash('error_msg', 'Bu randevuyu düzenleme yetkiniz yok.');
      return res.redirect('/appointments');
    }
    
    // Danışman düzenliyorsa, yararlanıcı listesini al
    let beneficiaries = [];
    if (req.user.userType === 'consultant') {
       beneficiaries = await Beneficiary.findAll({
         where: { consultantId: req.user.id },
         include: { model: User, as: 'user' }
       });
    }

    res.render('appointments/edit', {
      title: 'Modifier le rendez-vous',
      appointment,
      // Tarih ve saati ayırmak için:
      appointmentDate: new Date(appointment.date).toISOString().split('T')[0],
      appointmentTime: new Date(appointment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      beneficiaries, // Danışman için
      user: req.user,
      isConsultant: req.user.userType === 'consultant'
    });
  } catch (err) {
    console.error('Appointment edit form error:', err);
    req.flash('error_msg', 'Randevu düzenleme formu yüklenirken bir hata oluştu.');
    res.redirect('/appointments');
  }
});

// Traitement du formulaire de modification
router.post('/:id/edit', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  const { beneficiaryId, date, time, type, description, location, notes, status } = req.body;
  const appointmentId = req.params.id;
  const dateTime = `${date} ${time}`; // Tarih ve saati birleştir

  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Beneficiary, as: 'beneficiary' }] 
    });

    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    // Yetki kontrolü
    const isOwner = (req.user.userType === 'consultant' && appointment.consultantId === req.user.id) ||
                    (req.user.userType === 'beneficiary' && appointment.beneficiary.userId === req.user.id);

    if (!isOwner) {
      req.flash('error_msg', 'Bu randevuyu düzenleme yetkiniz yok.');
      return res.redirect('/appointments');
    }

    let finalBeneficiaryId = appointment.beneficiaryId;
    // Eğer danışman düzenliyorsa ve yararlanıcıyı değiştiriyorsa, ID'yi güncelle
    if (req.user.userType === 'consultant' && beneficiaryId) {
        // Danışman seçilen yararlanıcının gerçekten kendine ait olup olmadığını kontrol etmeli
        const isOwnBeneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: req.user.id } });
        if (!isOwnBeneficiary) {
            req.flash('error_msg', 'Geçersiz yararlanıcı seçimi.');
            return res.redirect(`/appointments/${appointmentId}/edit`);
        }
        finalBeneficiaryId = beneficiaryId;
    }

    await appointment.update({
      beneficiaryId: finalBeneficiaryId,
      date: dateTime,
      type,
      description,
      location,
      notes,
      status
    });

    req.flash('success_msg', 'Rendez-vous modifié avec succès.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment edit error:', err);
    req.flash('error_msg', 'Une erreur est survenue lors de la modification du rendez-vous.');
    res.redirect(`/appointments/${appointmentId}/edit`);
  }
});

// Suppression d'un rendez-vous
router.post('/:id/delete', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  const appointmentId = req.params.id;
  
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Beneficiary, as: 'beneficiary' }] 
    });

    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    // Yetki kontrolü
    const isOwner = (req.user.userType === 'consultant' && appointment.consultantId === req.user.id) ||
                    (req.user.userType === 'beneficiary' && appointment.beneficiary.userId === req.user.id);
                    
    if (!isOwner) {
      req.flash('error_msg', 'Bu randevuyu silme yetkiniz yok.');
      return res.redirect('/appointments');
    }

    await appointment.destroy();
    req.flash('success_msg', 'Rendez-vous supprimé avec succès.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment delete error:', err);
    req.flash('error_msg', 'Une erreur est survenue lors de la suppression du rendez-vous.');
    res.redirect('/appointments');
  }
});

module.exports = router;
