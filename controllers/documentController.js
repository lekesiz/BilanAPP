const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Document, Beneficiary, User } = require('../models');
const { logCreditChange } = require('../services/creditService');

// --- Multer Configuration (Should ideally be configured once in app.js or a config file) ---
// For now, keep it here, but consider centralizing it.
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads/documents');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|png|jpg|jpeg|xls|xlsx|ppt|pptx|txt/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Type de fichier non supporté.'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
  fileFilter,
}).single('documentFile');

// Middleware wrapper for Multer to handle errors gracefully with flash messages
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error during upload:', err);
      req.flash('error_msg', `Erreur de téléchargement: ${err.message}`);
      // Redirect back to upload form, potentially preserving other form data if needed
      return res.redirect('/documents/upload');
    }
    // If file upload is optional and no file is provided, it's not an error
    // if (!req.file) {
    //     console.log('No file selected for upload.');
    // }
    next(); // Proceed to the controller function if upload is successful or no file
  });
};

// --- Route Handlers ---

// GET /documents - List documents
exports.listDocuments = async (req, res) => {
  try {
    let whereClause = {};
    const queryOptions = {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'userType'],
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    };

    const { userType } = req.user;
    const userId = req.user.id;
    const isAdmin = req.user.forfaitType === 'Admin';

    if (req.query.category) whereClause.category = req.query.category;

    if (isAdmin) {
      if (
        req.query.beneficiary &&
        req.query.beneficiary !== 'consultant_only'
      ) {
        whereClause.beneficiaryId = req.query.beneficiary;
      } else if (req.query.beneficiary === 'consultant_only') {
        whereClause.uploadedBy = userId; // TODO: Clarify this filter for Admin
        whereClause.beneficiaryId = null;
      }
    } else if (userType === 'consultant') {
      const beneficiaries = await Beneficiary.findAll({
        where: { consultantId: userId },
        attributes: ['id'],
      });
      const ownBeneficiaryIds = beneficiaries.map((b) => b.id);
      let beneficiaryFilterClause = {};
      if (req.query.beneficiary === 'consultant_only') {
        beneficiaryFilterClause = { uploadedBy: userId, beneficiaryId: null };
      } else if (req.query.beneficiary) {
        if (ownBeneficiaryIds.includes(parseInt(req.query.beneficiary, 10))) {
          beneficiaryFilterClause = { beneficiaryId: req.query.beneficiary };
        } else {
          beneficiaryFilterClause.id = -1;
        }
      } else {
        beneficiaryFilterClause = {
          [Op.or]: [
            { beneficiaryId: { [Op.in]: ownBeneficiaryIds } },
            { uploadedBy: userId },
          ],
        };
      }
      whereClause = { ...whereClause, ...beneficiaryFilterClause };
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId },
      });
      if (!beneficiaryProfile) return res.redirect('/dashboard');
      whereClause.beneficiaryId = beneficiaryProfile.id;
    }

    queryOptions.where = whereClause;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    queryOptions.limit = limit;
    queryOptions.offset = offset;
    queryOptions.distinct = true;

    const { count, rows } = await Document.findAndCountAll(queryOptions);
    const documents = rows.map((d) => d.get({ plain: true }));

    let beneficiariesForFilter = [];
    if (isAdmin || userType === 'consultant') {
      const whereCondition = isAdmin ? {} : { consultantId: userId };
      const benefs = await Beneficiary.findAll({
        where: whereCondition,
        attributes: ['id'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiariesForFilter = benefs.map((b) => b.get({ plain: true }));
    }
    const categories = Document.getAttributes().category.values;
    const totalPages = Math.ceil(count / limit);

    res.render('documents/index', {
      title: 'Mes Documents',
      documents,
      beneficiaries: beneficiariesForFilter,
      categories,
      selectedBeneficiary: req.query.beneficiary,
      selectedCategory: req.query.category,
      user: req.user,
      isConsultant: userType === 'consultant',
      isAdmin,
      pagination: {
        page,
        limit,
        totalRows: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        beneficiary: req.query.beneficiary || '',
        category: req.query.category || '',
      },
    });
  } catch (err) {
    console.error('Documents list error:', err);
    req.flash('error_msg', 'Erreur chargement des documents.');
    res.redirect('/dashboard');
  }
};

// GET /documents/upload - Show upload form
exports.showUploadForm = async (req, res) => {
  try {
    let beneficiaries = [];
    let preselectedBeneficiary = req.query.beneficiary;
    const preselectedCategory = req.query.category;
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';

    if (isAdmin || isConsultant) {
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      const rawBeneficiaries = await Beneficiary.findAll({
        where: whereCondition,
        include: { model: User, as: 'user' },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiaries = rawBeneficiaries.map((b) => b.get({ plain: true }));
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });
      if (!beneficiaryProfile) return res.redirect('/documents');
      preselectedBeneficiary = beneficiaryProfile.id;
    }
    const categories = Document.getAttributes().category.values;

    res.render('documents/upload', {
      title: 'Télécharger un document',
      user: req.user,
      beneficiaries,
      categories,
      preselectedBeneficiary,
      preselectedCategory,
      isConsultant: req.user.userType === 'consultant',
    });
  } catch (error) {
    console.error('Upload form error:', error);
    req.flash('error_msg', 'Erreur chargement formulaire upload.');
    res.redirect('/documents');
  }
};

// POST /documents/upload - Handle file upload
exports.uploadDocument = async (req, res) => {
  // handleUpload middleware should have run before this
  if (!req.file) {
    req.flash(
      'error_msg',
      'Aucun fichier sélectionné ou type de fichier invalide.',
    );
    // Potentially need credit refund if checkAndDeductCredits ran
    return res.redirect('/documents/upload');
  }

  const {
    beneficiaryId, description, category, bilanPhase,
  } = req.body;
  const uploadedBy = req.user.id;
  const cost = req.creditCost; // Provided by checkAndDeductCredits middleware
  const isAdmin = req.user.forfaitType === 'Admin';

  try {
    let finalBeneficiaryId = null;
    if (isAdmin || req.user.userType === 'consultant') {
      if (beneficiaryId && beneficiaryId !== '') {
        const benefWhere = { id: beneficiaryId };
        if (!isAdmin) benefWhere.consultantId = req.user.id;
        const isAllowedBeneficiary = await Beneficiary.findOne({
          where: benefWhere,
        });
        if (!isAllowedBeneficiary) {
          req.flash('error_msg', 'Sélection bénéficiaire invalide.');
          throw new Error('Invalid beneficiary assignment'); // Throw error to trigger catch block
        }
        finalBeneficiaryId = parseInt(beneficiaryId, 10);
      }
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil non trouvé.');
        throw new Error('Beneficiary profile not found');
      }
      finalBeneficiaryId = beneficiaryProfile.id;
    }

    const newDocument = await Document.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      description,
      category,
      bilanPhase: bilanPhase || null,
      uploadedBy,
      beneficiaryId: finalBeneficiaryId,
    });

    await logCreditChange(
      uploadedBy, // userId
      -cost, // amount (negative because it's a deduction)
      'DOCUMENT_UPLOAD',
      `Téléchargement document '${newDocument.originalName}'`,
      null, // adminUserId (null because it's not an admin action)
      newDocument.id, // relatedResourceId
      'Document', // relatedResourceType
    );

    req.flash('success_msg', `Document téléchargé (${cost} crédits déduits).`);
    res.redirect('/documents');
  } catch (dbErr) {
    console.error('Document DB save error:', dbErr);
    // Attempt to delete the orphaned file if DB save fails
    if (req.file?.path) {
      try {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting orphaned file:', unlinkErr);
        });
      } catch (unlinkErr) {
        console.error('Sync Error deleting orphaned file:', unlinkErr);
      }
    }
    // TODO: Refund credit if possible/necessary
    req.flash('error_msg', `Erreur sauvegarde document: ${dbErr.message}`);
    res.redirect('/documents/upload');
  }
};

// GET /documents/:id/edit - Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          required: false,
          include: { model: User, as: 'user' },
        },
      ],
    });
    if (!document) {
      req.flash('error_msg', 'Document non trouvé.');
      return res.redirect('/documents');
    }

    let canEdit = false;
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';
    if (isAdmin || req.user.id === document.uploadedBy) {
      canEdit = true;
    } else if (
      isConsultant &&
      document.beneficiary?.consultantId === req.user.id
    ) {
      canEdit = true;
    }
    if (!canEdit) {
      req.flash('error_msg', 'Modification non autorisée.');
      return res.redirect('/documents');
    }

    let beneficiaries = [];
    if (isAdmin || isConsultant) {
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      const rawBeneficiaries = await Beneficiary.findAll({
        where: whereCondition,
        include: { model: User, as: 'user' },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiaries = rawBeneficiaries.map((b) => b.get({ plain: true }));
    }
    const categories = Document.getAttributes().category.values;
    const bilanPhases = Document.getAttributes().bilanPhase.values;

    res.render('documents/edit', {
      title: `Modifier: ${document.originalName}`,
      document: document.get({ plain: true }),
      beneficiaries,
      categories,
      bilanPhases,
      user: req.user,
      isConsultant,
    });
  } catch (error) {
    console.error('Document edit form error:', error);
    req.flash('error_msg', 'Erreur chargement formulaire modification.');
    res.redirect('/documents');
  }
};

// POST /documents/:id/edit - Update document metadata
exports.updateDocument = async (req, res) => {
  const documentId = req.params.id;
  const {
    description, category, bilanPhase, beneficiaryId,
  } = req.body;
  try {
    const document = await Document.findByPk(documentId, {
      include: { model: Beneficiary, as: 'beneficiary' },
    });
    if (!document) {
      req.flash('error_msg', 'Document non trouvé.');
      return res.redirect('/documents');
    }

    let canEdit = false;
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';
    if (isAdmin || req.user.id === document.uploadedBy) {
      canEdit = true;
    } else if (
      isConsultant &&
      document.beneficiary?.consultantId === req.user.id
    ) {
      canEdit = true;
    }
    if (!canEdit) {
      req.flash('error_msg', 'Modification non autorisée.');
      return res.redirect('/documents');
    }

    let finalBeneficiaryId = document.beneficiaryId;
    if (isAdmin || isConsultant) {
      const newBenefId =
        beneficiaryId && beneficiaryId !== ''
          ? parseInt(beneficiaryId, 10)
          : null;
      if (newBenefId !== finalBeneficiaryId) {
        // Only check if assignment changes
        if (newBenefId) {
          // If assigning to a beneficiary
          const benefWhere = { id: newBenefId };
          if (!isAdmin) benefWhere.consultantId = req.user.id;
          const canAssignBeneficiary = await Beneficiary.findOne({
            where: benefWhere,
          });
          if (!canAssignBeneficiary) {
            req.flash(
              'error_msg',
              'Assignation bénéficiaire non valide/autorisé.',
            );
            return res.redirect(`/documents/${documentId}/edit`);
          }
          finalBeneficiaryId = newBenefId;
        } else {
          // Unassigning
          finalBeneficiaryId = null;
        }
      }
    } else if (beneficiaryId && beneficiaryId !== finalBeneficiaryId) {
      req.flash('error_msg', 'Modification assignation non autorisée.');
      return res.redirect(`/documents/${documentId}/edit`);
    }

    await document.update({
      description,
      category,
      bilanPhase: bilanPhase || null,
      beneficiaryId: finalBeneficiaryId,
    });

    req.flash('success_msg', 'Document mis à jour.');
    res.redirect('/documents');
  } catch (error) {
    console.error('Document update error:', error);
    req.flash('error_msg', 'Erreur mise à jour document.');
    res.redirect(`/documents/${documentId}/edit`);
  }
};

// POST /documents/:id/delete - Delete document
exports.deleteDocument = async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  const { userType } = req.user;
  const isAdmin = req.user.forfaitType === 'Admin';
  try {
    const document = await Document.findByPk(documentId, {
      include: { model: Beneficiary, as: 'beneficiary' },
    });
    if (!document) {
      req.flash('error_msg', 'Document non trouvé.');
      return res.redirect('/documents');
    }

    let canDelete = false;
    if (isAdmin) {
      canDelete = true;
    } else if (userType === 'consultant') {
      const isOwnBeneficiary = document.beneficiary?.consultantId === userId;
      canDelete = document.uploadedBy === userId || isOwnBeneficiary;
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId },
      });
      canDelete =
        beneficiaryProfile &&
        document.beneficiaryId === beneficiaryProfile.id &&
        document.uploadedBy === userId;
    }
    if (!canDelete) {
      req.flash('error_msg', 'Suppression non autorisée.');
      return res.redirect('/documents');
    }

    // Rely on the afterDestroy hook in the model to delete the file
    await document.destroy();
    req.flash('success_msg', 'Document supprimé.');
    res.redirect('/documents');
  } catch (err) {
    console.error('Document delete error:', err);
    req.flash('error_msg', 'Erreur lors de la suppression.');
    res.redirect('/documents');
  }
};

// Expose Multer middleware if needed by the router
exports.handleUploadMiddleware = handleUpload;
