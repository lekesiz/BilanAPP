// const { Op } = require('sequelize'); // Kullanılmadığı için kaldırıldı
// const bcryptjs = require('bcryptjs'); // Kullanılmadığı için kaldırıldı
const { User, Forfait, Beneficiary, CreditTransaction } = require('../models');
const { logCreditChange, getDefaultCreditsForForfait } = require('../services/creditService');

// Kullanıcıları listeleme
exports.listUsers = async (req, res) => {
  try {
    const [users, forfaits] = await Promise.all([
      User.findAll({
        include: [{ model: Forfait, as: 'forfait' }],
        order: [
          ['lastName', 'ASC'],
          ['firstName', 'ASC'],
        ],
      }),
      Forfait.findAll({ attributes: ['name'], order: [['name', 'ASC']] }),
    ]);

    const plainUsers = users.map((u) => u.get({ plain: true }));
    const forfaitOptions = forfaits.map((f) => f.name);

    res.render('admin/users', {
      title: 'Gestion des Utilisateurs',
      users: plainUsers,
      user: req.user,
      forfaitOptions, // Modal için eklendi
      layout: 'main',
    });
  } catch (error) {
    console.error('Error listing users for admin:', error);
    req.flash('error_msg', 'Erreur lors du chargement de la liste des utilisateurs.');
    res.redirect('/dashboard'); // Veya admin dashboard'u varsa oraya
  }
};

// GET Kullanıcı Ekleme Formu
exports.showAddUserForm = async (req, res) => {
  try {
    const forfaits = await Forfait.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']],
    });
    const forfaitOptions = forfaits.map((f) => f.name);
    const userTypeOptions = User.getAttributes().userType.values;
    res.render('admin/user-form', {
      // Yeni genel form şablonu
      title: 'Ajouter un Nouvel Utilisateur',
      user: req.user,
      editing: false, // Ekleme modu
      userData: {}, // Boş veri
      forfaitOptions,
      userTypeOptions,
      layout: 'main',
    });
  } catch (error) {
    console.error('Admin User Add GET Error:', error);
    req.flash('error_msg', "Erreur lors du chargement du formulaire d'ajout.");
    res.redirect('/admin/users');
  }
};

// POST Yeni Kullanıcı Ekleme
exports.addUser = async (req, res) => {
  const {
    firstName, lastName, email, password, userType, forfaitType, availableCredits,
  } =
    req.body;
  const errors = [];

  // Doğrulamalar
  if (!firstName || !lastName || !email || !password || !userType) {
    errors.push({
      msg: 'Veuillez remplir les champs Prénom, Nom, Email, Mot de Passe et Type.',
    });
  }
  if (password && password.length < 6) {
    // Şifre varsa uzunluğunu kontrol et
    errors.push({
      msg: 'Le mot de passe doit contenir au moins 6 caractères.',
    });
  }
  const credits = parseInt(availableCredits, 10) || 0;
  if (Number.isNaN(credits) || credits < 0) {
    errors.push({ msg: 'Le nombre de crédits doit être un nombre positif.' });
  }

  // Eposta kontrolü (try-catch eklendi)
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      errors.push({ msg: 'Cet email est déjà enregistré.' });
    }
  } catch (error) {
    console.error('Error checking existing email:', error);
    errors.push({ msg: "Erreur lors de la vérification de l'email." });
  }

  if (errors.length > 0) {
    let forfaitOptions = [];
    let userTypeOptions = [];
    try {
      const forfaits = await Forfait.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']],
      });
      forfaitOptions = forfaits.map((f) => f.name);
      userTypeOptions = User.getAttributes().userType.values;
    } catch (err) {
      console.error('Error fetching options for re-render:', err);
    }

    return res.render('admin/user-form', {
      title: 'Ajouter un Nouvel Utilisateur',
      errors,
      editing: false,
      userData: req.body,
      forfaitOptions,
      userTypeOptions,
      user: req.user,
      layout: 'main',
    });
  }

  try {
    await User.create({
      firstName,
      lastName,
      email,
      password, // Hook hashleyecek
      userType,
      forfaitType: forfaitType || null,
      availableCredits: credits,
    });

    req.flash('success_msg', 'Nouvel utilisateur ajouté avec succès.');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Admin Add User POST Error:', error);
    req.flash('error_msg', 'User add error.');
    let forfaitOptions = [];
    let userTypeOptions = [];
    try {
      const forfaits = await Forfait.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']],
      });
      forfaitOptions = forfaits.map((f) => f.name);
      userTypeOptions = User.getAttributes().userType.values;
    } catch (err) {
      console.error('Error fetching options for re-render:', err);
    }

    res.render('admin/user-form', {
      title: 'Ajouter un Nouvel Utilisateur',
      errors: [{ msg: 'Erreur serveur lors de la création.' }],
      editing: false,
      userData: req.body,
      forfaitOptions,
      userTypeOptions,
      user: req.user,
      layout: 'main',
    });
  }
};

// GET Kullanıcı Düzenleme Formu
exports.showEditUserForm = async (req, res) => {
  try {
    const userToEdit = await User.findByPk(req.params.id);
    if (!userToEdit) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const forfaits = await Forfait.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']],
    });
    const forfaitOptions = forfaits.map((f) => f.name);
    const userTypeOptions = User.getAttributes().userType.values;

    res.render('admin/user-form', {
      // Genel form şablonu
      title: `Modifier Utilisateur: ${userToEdit.firstName} ${userToEdit.lastName}`,
      user: req.user,
      editing: true, // Düzenleme modu
      userData: userToEdit.get({ plain: true }), // Düz obje gönder
      forfaitOptions,
      userTypeOptions,
      layout: 'main',
    });
  } catch (error) {
    console.error('Admin User Edit GET Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire utilisateur.');
    res.redirect('/admin/users');
  }
};

// POST Kullanıcı Güncelleme
exports.updateUser = async (req, res) => {
  const userIdToEdit = req.params.id;
  const {
    firstName, lastName, userType, forfaitType, newPassword, confirmPassword,
  } = req.body;
  const errors = [];

  // Doğrulamalar
  if (!firstName || !lastName || !userType) {
    errors.push({ msg: 'Veuillez remplir les champs Prénom, Nom et Type.' });
  }
  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      errors.push({
        msg: 'Pour changer le mot de passe, veuillez remplir les deux champs de mot de passe.',
      });
    } else if (newPassword.length < 6) {
      errors.push({
        msg: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
      });
    } else if (newPassword !== confirmPassword) {
      errors.push({ msg: 'Les nouveaux mots de passe ne correspondent pas.' });
    }
  }

  if (errors.length > 0) {
    let forfaitOptions = [];
    let userTypeOptions = [];
    try {
      const forfaits = await Forfait.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']],
      });
      forfaitOptions = forfaits.map((f) => f.name);
      userTypeOptions = User.getAttributes().userType.values;
    } catch (err) {
      console.error('Error fetching options for re-render:', err);
    }

    const userDataOnError = { ...req.body, id: userIdToEdit };

    return res.render('admin/user-form', {
      title: `Modifier Utilisateur: ${userDataOnError.firstName || ''} ${userDataOnError.lastName || ''}`,
      errors,
      editing: true,
      userData: userDataOnError,
      forfaitOptions,
      userTypeOptions,
      user: req.user,
      layout: 'main',
    });
  }

  try {
    const userToEdit = await User.findByPk(userIdToEdit);
    if (!userToEdit) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const updateData = {
      firstName,
      lastName,
      userType,
      forfaitType: forfaitType || null,
    };

    // Şifre hook tarafından hashlenmeli, manuel hashlemeyi kaldır
    if (newPassword) {
      updateData.password = newPassword;
    }

    await userToEdit.update(updateData);

    req.flash(
      'success_msg',
      `Utilisateur mis à jour avec succès.${
        newPassword ? ' Le mot de passe a également été changé.' : ''
      }`,
    );
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Admin Update User POST Error:', error);
    req.flash('error_msg', "Erreur lors de la mise à jour de l'utilisateur.");
    let forfaitOptionsOnError = [];
    let userTypeOptionsOnError = [];
    try {
      const forfaits = await Forfait.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']],
      });
      forfaitOptionsOnError = forfaits.map((f) => f.name);
      userTypeOptionsOnError = User.getAttributes().userType.values;
    } catch (err) {
      console.error('Error fetching options for re-render:', err);
    }

    const userDataOnCatchError = { ...req.body, id: userIdToEdit };

    res.render('admin/user-form', {
      title: `Modifier Utilisateur: ${userDataOnCatchError.firstName || ''} ${userDataOnCatchError.lastName || ''}`,
      errors: [{ msg: 'Erreur serveur inattendue.' }],
      editing: true,
      userData: userDataOnCatchError,
      forfaitOptions: forfaitOptionsOnError,
      userTypeOptions: userTypeOptionsOnError,
      user: req.user,
      layout: 'main',
    });
  }
};

// POST Kredi Ayarlama (Admin)
exports.adjustCredits = async (req, res) => {
  const userId = req.params.id;
  const { amount, reason } = req.body;
  const adminId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const creditAmount = parseInt(amount, 10);
    if (Number.isNaN(creditAmount)) {
      req.flash('error_msg', 'Montant de crédit invalide.');
      return res.redirect(`/admin/users/${userId}/credits`);
    }

    const newBalance = user.availableCredits + creditAmount;
    if (newBalance < 0) {
      req.flash('error_msg', 'Le solde ne peut pas être négatif.');
      return res.redirect(`/admin/users/${userId}/credits`);
    }

    await CreditTransaction.create({
      userId,
      amount: creditAmount,
      type: creditAmount > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_REMOVE',
      reason,
      adminId
    });

    await user.update({ availableCredits: newBalance });

    req.flash('success_msg', `Crédits ajustés avec succès. Nouveau solde: ${newBalance}`);
    res.redirect(`/admin/users/${userId}/credits`);
  } catch (error) {
    console.error('Admin Credit Adjustment Error:', error);
    req.flash('error_msg', 'Erreur lors de l\'ajustement des crédits.');
    res.redirect(`/admin/users/${userId}/credits`);
  }
};

// POST Kullanıcı Silme
exports.deleteUser = async (req, res) => {
  const userIdToDelete = req.params.id;
  const currentUserId = req.user.id;

  // Kendini silmeyi engelle
  if (userIdToDelete === currentUserId) {
    // == kullanıldı çünkü biri string, diğeri number olabilir
    req.flash('error_msg', 'Vous ne pouvez pas supprimer votre propre compte.');
    return res.redirect('/admin/users');
  }

  try {
    const userToDelete = await User.findByPk(userIdToDelete, {
      include: [
        {
          model: Beneficiary,
          as: 'beneficiaries',
          attributes: ['id']
        }
      ]
    });

    if (!userToDelete) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    // İlişkili verilerin silinmesi
    // 1. Faydalanıcı profilleri ve ilişkili veriler otomatik silinecek (CASCADE)
    // 2. Danışman olarak atanmış faydalanıcıların consultantId'si NULL olarak güncellenecek
    await Beneficiary.update(
      { consultantId: null },
      { where: { consultantId: userIdToDelete } }
    );

    // Kullanıcıyı sil
    const userFullName = `${userToDelete.firstName} ${userToDelete.lastName}`;
    await userToDelete.destroy();

    req.flash('success_msg', `Utilisateur ${userFullName} supprimé avec succès.`);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Admin User Delete POST Error:', error);
    req.flash('error_msg', "Erreur lors de la suppression de l'utilisateur.");
    res.redirect('/admin/users');
  }
};

// --- AI Doküman Oluşturma Simülasyonu ---
// const GENERATE_SYNTHESIS_COST = 20; // Kullanılmadığı için kaldırıldı
// const GENERATE_ACTIONPLAN_COST = 15; // Kullanılmadığı için kaldırıldı
// const MIN_FORFAIT_AI = 'Premium'; // Kullanılmadığı için kaldırıldı

// --- Forfait Yönetimi ---

// GET Paket Listesi
exports.listForfaits = async (req, res) => {
  try {
    const forfaits = await Forfait.findAll({ order: [['name', 'ASC']] });
    res.render('admin/forfaits', {
      title: 'Gestion des Forfaits',
      forfaits: forfaits.map((f) => f.get({ plain: true })), // Plain objeler gönder
      user: req.user,
      layout: 'main',
    });
  } catch (error) {
    console.error('Admin Forfaits List Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement des forfaits.');
    res.redirect('/admin'); // Admin ana sayfasına?
  }
};

// GET Paket Düzenleme Sayfası
exports.showEditForfaitForm = async (req, res) => {
  try {
    const forfaitName = req.params.name;
    const forfaitToEdit = await Forfait.findByPk(forfaitName);
    if (!forfaitToEdit) {
      req.flash('error_msg', 'Forfait non trouvé.');
      return res.redirect('/admin/forfaits');
    }
    res.render('admin/forfait-edit', {
      title: `Modifier Forfait: ${forfaitToEdit.name}`,
      forfaitToEdit: forfaitToEdit.get({ plain: true }), // Plain obje gönder
      user: req.user,
      layout: 'main',
    });
  } catch (error) {
    console.error('Admin Forfait Edit GET Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire forfait.');
    res.redirect('/admin/forfaits');
  }
};

// POST Paket Güncelleme
exports.updateForfait = async (req, res) => {
  const forfaitName = req.params.name;
  const {
    description, defaultCredits, features, maxBeneficiaries, maxAiGenerationsMonthly,
  } =
    req.body;

  const credits = parseInt(defaultCredits, 10);
  const maxBen =
    maxBeneficiaries === '' || maxBeneficiaries === null ? null : parseInt(maxBeneficiaries, 10);
  const maxAi =
    maxAiGenerationsMonthly === '' || maxAiGenerationsMonthly === null ?
      null :
      parseInt(maxAiGenerationsMonthly, 10);

  // Doğrulamalar
  if (Number.isNaN(credits) || credits < 0) {
    req.flash('error_msg', 'Le nombre de crédits par défaut doit être un nombre positif.');
    return res.redirect(`/admin/forfaits/${forfaitName}/edit`);
  }
  if (maxBen !== null && (Number.isNaN(maxBen) || maxBen < 0)) {
    req.flash('error_msg', 'La limite de bénéficiaires doit être un nombre positif ou vide.');
    return res.redirect(`/admin/forfaits/${forfaitName}/edit`);
  }
  if (maxAi !== null && (Number.isNaN(maxAi) || maxAi < 0)) {
    req.flash('error_msg', 'La limite de générations IA doit être un nombre positif ou vide.');
    return res.redirect(`/admin/forfaits/${forfaitName}/edit`);
  }

  try {
    const forfaitToEdit = await Forfait.findByPk(forfaitName);
    if (!forfaitToEdit) {
      req.flash('error_msg', 'Forfait non trouvé.');
      return res.redirect('/admin/forfaits');
    }
    // 'Admin' paketinin düzenlenmesini engelle
    if (forfaitName === 'Admin') {
      req.flash('error_msg', 'Le forfait Admin ne peut pas être modifié.');
      return res.redirect('/admin/forfaits');
    }

    await forfaitToEdit.update({
      description,
      defaultCredits: credits,
      features,
      maxBeneficiaries: maxBen,
      maxAiGenerationsMonthly: maxAi,
    });

    req.flash('success_msg', `Forfait '${forfaitName}' mis à jour avec succès.`);
    res.redirect('/admin/forfaits');
  } catch (error) {
    console.error('Admin Forfait Update POST Error:', error);
    req.flash('error_msg', 'Erreur lors de la mise à jour du forfait.');
    res.redirect(`/admin/forfaits/${forfaitName}/edit`);
  }
};

// POST Kullanıcı Paket Tipi Güncelleme
exports.updateUserForfait = async (req, res) => {
  const userIdToUpdate = req.params.id;
  const adminUserId = req.user.id;
  const { forfaitType } = req.body;

  const newForfait = forfaitType === '' ? null : forfaitType;

  try {
    const [userToUpdate, forfaitExists] = await Promise.all([
      User.findByPk(userIdToUpdate),
      newForfait === null || (await Forfait.findByPk(newForfait)), // null ise kontrol etme
    ]);

    if (!userToUpdate) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }
    if (!forfaitExists) {
      req.flash('error_msg', 'Type de forfait non valide.');
      return res.redirect('/admin/users');
    }
    // Kendini düzenlemeyi engelle
    if (userIdToUpdate === adminUserId) {
      req.flash('error_msg', 'Vous ne pouvez pas modifier votre propre forfait.');
      return res.redirect('/admin/users');
    }

    const oldForfait = userToUpdate.forfaitType;
    const oldCredits = userToUpdate.availableCredits;
    let newCredits = oldCredits;

    if (oldForfait !== newForfait) {
      newCredits = await getDefaultCreditsForForfait(newForfait);
      const creditChangeAmount = newCredits - oldCredits;
      const description = `Changement de forfait: ${oldForfait || 'Aucun'} -> ${newForfait || 'Aucun'}`;

      if (creditChangeAmount !== 0) {
        await logCreditChange(
          userIdToUpdate,
          creditChangeAmount,
          'ADMIN_FORFAIT_CHANGE',
          description,
          adminUserId,
        );
      }

      await userToUpdate.update({
        forfaitType: newForfait,
        availableCredits: newCredits,
      });

      req.flash(
        'success_msg',
        `Forfait de ${userToUpdate.firstName} ${userToUpdate.lastName} mis à jour vers ${newForfait || 'Aucun'}. Crédits ajustés à ${newCredits}.`,
      );
    } else {
      // Opsiyonel: Değişiklik yoksa bilgi mesajı
      // req.flash('info_msg', 'Le type de forfait est déjà le même.');
    }

    res.redirect('/admin/users');
  } catch (error) {
    console.error('Admin User Forfait Update POST Error:', error);
    req.flash('error_msg', 'Erreur lors de la mise à jour du forfait utilisateur.');
    res.redirect('/admin/users');
  }
};

// --- Package Management ---

// GET Package List
exports.listPackages = async (req, res) => {
  try {
    const packages = await Forfait.findAll({
      order: [['name', 'ASC']],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    res.render('admin/packages', {
      title: 'Gestion des Packages',
      packages: packages.map(p => p.get({ plain: true })),
      user: req.user,
      layout: 'main'
    });
  } catch (error) {
    console.error('Admin Packages List Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement des packages.');
    res.redirect('/admin');
  }
};

// GET Package Creation Form
exports.showCreatePackageForm = async (req, res) => {
  try {
    res.render('admin/package-form', {
      title: 'Créer un Nouveau Package',
      user: req.user,
      editing: false,
      packageData: {},
      layout: 'main'
    });
  } catch (error) {
    console.error('Admin Package Create Form Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire.');
    res.redirect('/admin/packages');
  }
};

// POST Create Package
exports.createPackage = async (req, res) => {
  const {
    name,
    description,
    defaultCredits,
    features,
    maxBeneficiaries,
    maxAiGenerationsMonthly,
    price,
    duration,
    isActive
  } = req.body;

  const errors = [];

  // Validations
  if (!name || !description) {
    errors.push({ msg: 'Le nom et la description sont requis.' });
  }

  const credits = parseInt(defaultCredits, 10);
  if (Number.isNaN(credits) || credits < 0) {
    errors.push({ msg: 'Le nombre de crédits par défaut doit être un nombre positif.' });
  }

  const maxBen = maxBeneficiaries === '' ? null : parseInt(maxBeneficiaries, 10);
  if (maxBen !== null && (Number.isNaN(maxBen) || maxBen < 0)) {
    errors.push({ msg: 'La limite de bénéficiaires doit être un nombre positif ou vide.' });
  }

  const maxAi = maxAiGenerationsMonthly === '' ? null : parseInt(maxAiGenerationsMonthly, 10);
  if (maxAi !== null && (Number.isNaN(maxAi) || maxAi < 0)) {
    errors.push({ msg: 'La limite de générations IA doit être un nombre positif ou vide.' });
  }

  if (errors.length > 0) {
    return res.render('admin/package-form', {
      title: 'Créer un Nouveau Package',
      errors,
      user: req.user,
      editing: false,
      packageData: req.body,
      layout: 'main'
    });
  }

  try {
    await Forfait.create({
      name,
      description,
      defaultCredits: credits,
      features,
      maxBeneficiaries: maxBen,
      maxAiGenerationsMonthly: maxAi,
      price: parseFloat(price) || 0,
      duration: parseInt(duration, 10) || 30,
      isActive: isActive === 'true'
    });

    req.flash('success_msg', 'Package créé avec succès.');
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Admin Package Create Error:', error);
    req.flash('error_msg', 'Erreur lors de la création du package.');
    res.render('admin/package-form', {
      title: 'Créer un Nouveau Package',
      errors: [{ msg: 'Erreur serveur lors de la création.' }],
      user: req.user,
      editing: false,
      packageData: req.body,
      layout: 'main'
    });
  }
};

// GET Package Edit Form
exports.showEditPackageForm = async (req, res) => {
  try {
    const packageName = req.params.name;
    const packageToEdit = await Forfait.findByPk(packageName);
    
    if (!packageToEdit) {
      req.flash('error_msg', 'Package non trouvé.');
      return res.redirect('/admin/packages');
    }

    res.render('admin/package-form', {
      title: `Modifier Package: ${packageToEdit.name}`,
      user: req.user,
      editing: true,
      packageData: packageToEdit.get({ plain: true }),
      layout: 'main'
    });
  } catch (error) {
    console.error('Admin Package Edit Form Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire.');
    res.redirect('/admin/packages');
  }
};

// POST Update Package
exports.updatePackage = async (req, res) => {
  const packageName = req.params.name;
  const {
    description,
    defaultCredits,
    features,
    maxBeneficiaries,
    maxAiGenerationsMonthly,
    price,
    duration,
    isActive
  } = req.body;

  const errors = [];

  const credits = parseInt(defaultCredits, 10);
  if (Number.isNaN(credits) || credits < 0) {
    errors.push({ msg: 'Le nombre de crédits par défaut doit être un nombre positif.' });
  }

  const maxBen = maxBeneficiaries === '' ? null : parseInt(maxBeneficiaries, 10);
  if (maxBen !== null && (Number.isNaN(maxBen) || maxBen < 0)) {
    errors.push({ msg: 'La limite de bénéficiaires doit être un nombre positif ou vide.' });
  }

  const maxAi = maxAiGenerationsMonthly === '' ? null : parseInt(maxAiGenerationsMonthly, 10);
  if (maxAi !== null && (Number.isNaN(maxAi) || maxAi < 0)) {
    errors.push({ msg: 'La limite de générations IA doit être un nombre positif ou vide.' });
  }

  if (errors.length > 0) {
    return res.render('admin/package-form', {
      title: `Modifier Package: ${packageName}`,
      errors,
      user: req.user,
      editing: true,
      packageData: { ...req.body, name: packageName },
      layout: 'main'
    });
  }

  try {
    const packageToEdit = await Forfait.findByPk(packageName);
    if (!packageToEdit) {
      req.flash('error_msg', 'Package non trouvé.');
      return res.redirect('/admin/packages');
    }

    if (packageName === 'Admin') {
      req.flash('error_msg', 'Le package Admin ne peut pas être modifié.');
      return res.redirect('/admin/packages');
    }

    await packageToEdit.update({
      description,
      defaultCredits: credits,
      features,
      maxBeneficiaries: maxBen,
      maxAiGenerationsMonthly: maxAi,
      price: parseFloat(price) || 0,
      duration: parseInt(duration, 10) || 30,
      isActive: isActive === 'true'
    });

    req.flash('success_msg', `Package '${packageName}' mis à jour avec succès.`);
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Admin Package Update Error:', error);
    req.flash('error_msg', 'Erreur lors de la mise à jour du package.');
    res.render('admin/package-form', {
      title: `Modifier Package: ${packageName}`,
      errors: [{ msg: 'Erreur serveur lors de la mise à jour.' }],
      user: req.user,
      editing: true,
      packageData: { ...req.body, name: packageName },
      layout: 'main'
    });
  }
};

// POST Delete Package
exports.deletePackage = async (req, res) => {
  const packageName = req.params.name;

  try {
    const packageToDelete = await Forfait.findByPk(packageName, {
      include: [{ model: User, as: 'users' }]
    });

    if (!packageToDelete) {
      req.flash('error_msg', 'Package non trouvé.');
      return res.redirect('/admin/packages');
    }

    if (packageName === 'Admin') {
      req.flash('error_msg', 'Le package Admin ne peut pas être supprimé.');
      return res.redirect('/admin/packages');
    }

    if (packageToDelete.users && packageToDelete.users.length > 0) {
      req.flash('error_msg', 'Ce package est utilisé par des utilisateurs et ne peut pas être supprimé.');
      return res.redirect('/admin/packages');
    }

    await packageToDelete.destroy();
    req.flash('success_msg', `Package '${packageName}' supprimé avec succès.`);
    res.redirect('/admin/packages');
  } catch (error) {
    console.error('Admin Package Delete Error:', error);
    req.flash('error_msg', 'Erreur lors de la suppression du package.');
    res.redirect('/admin/packages');
  }
};

// --- Credit Management ---

// GET Credit Adjustment Form
exports.showCreditAdjustmentForm = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const creditHistory = await CreditTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.render('admin/credit-adjustment', {
      title: `Ajustement des Crédits - ${user.firstName} ${user.lastName}`,
      user: req.user,
      targetUser: user.get({ plain: true }),
      creditHistory: creditHistory.map(t => t.get({ plain: true })),
      layout: 'main'
    });
  } catch (error) {
    console.error('Admin Credit Adjustment Form Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire.');
    res.redirect('/admin/users');
  }
};

// GET Credit History
exports.showCreditHistory = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const creditHistory = await CreditTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'admin',
        attributes: ['firstName', 'lastName']
      }]
    });

    res.render('admin/credit-history', {
      title: `Historique des Crédits - ${user.firstName} ${user.lastName}`,
      user: req.user,
      targetUser: user.get({ plain: true }),
      creditHistory: creditHistory.map(t => t.get({ plain: true })),
      layout: 'main'
    });
  } catch (error) {
    console.error('Admin Credit History Error:', error);
    req.flash('error_msg', 'Erreur lors du chargement de l\'historique.');
    res.redirect('/admin/users');
  }
};

// POST Credit Refund
exports.processCreditRefund = async (req, res) => {
  const userId = req.params.id;
  const { transactionId, reason } = req.body;
  const adminId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/admin/users');
    }

    const transaction = await CreditTransaction.findByPk(transactionId);
    if (!transaction) {
      req.flash('error_msg', 'Transaction non trouvée.');
      return res.redirect(`/admin/users/${userId}/credits/history`);
    }

    if (transaction.type !== 'PURCHASE') {
      req.flash('error_msg', 'Seules les transactions d\'achat peuvent être remboursées.');
      return res.redirect(`/admin/users/${userId}/credits/history`);
    }

    const newBalance = user.availableCredits + transaction.amount;
    await CreditTransaction.create({
      userId,
      amount: transaction.amount,
      type: 'REFUND',
      reason: `Remboursement: ${reason}`,
      adminId,
      relatedTransactionId: transactionId
    });

    await user.update({ availableCredits: newBalance });

    req.flash('success_msg', `Remboursement effectué avec succès. Nouveau solde: ${newBalance}`);
    res.redirect(`/admin/users/${userId}/credits/history`);
  } catch (error) {
    console.error('Admin Credit Refund Error:', error);
    req.flash('error_msg', 'Erreur lors du remboursement.');
    res.redirect(`/admin/users/${userId}/credits/history`);
  }
};
