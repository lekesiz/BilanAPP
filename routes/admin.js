const express = require('express');

const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// Admin Ana Sayfası (Yönlendirme)
router.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.redirect('/admin/users'); // Şimdilik kullanıcı listesine yönlendir
});

// Kullanıcı Yönetimi
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.listUsers);
// GET Kullanıcı Ekleme Formu
router.get('/users/add', ensureAuthenticated, ensureAdmin, adminController.showAddUserForm);
// POST Yeni Kullanıcı Ekleme
router.post('/users/add', ensureAuthenticated, ensureAdmin, adminController.addUser);
// GET Kullanıcı Düzenleme Formu
router.get('/users/:id/edit', ensureAuthenticated, ensureAdmin, adminController.showEditUserForm);
// POST Kullanıcı Güncelleme
router.post('/users/:id/edit', ensureAuthenticated, ensureAdmin, adminController.updateUser);

// POST Kredi Ayarlama
router.post(
  '/users/:id/adjust-credits',
  ensureAuthenticated,
  ensureAdmin,
  adminController.adjustCredits,
);

// POST Kullanıcı Silme
router.post('/users/:id/delete', ensureAuthenticated, ensureAdmin, adminController.deleteUser);

// --- Forfait Yönetimi ---
router.get('/forfaits', ensureAuthenticated, ensureAdmin, adminController.listForfaits);
router.get(
  '/forfaits/:name/edit',
  ensureAuthenticated,
  ensureAdmin,
  adminController.showEditForfaitForm,
);
router.post(
  '/forfaits/:name/edit',
  ensureAuthenticated,
  ensureAdmin,
  adminController.updateForfait,
);

// POST Paket Tipi Güncelleme (Kullanıcı için - Zaten vardı, yeniden ekleniyor)
router.post(
  '/users/:id/update-forfait',
  ensureAuthenticated,
  ensureAdmin,
  adminController.updateUserForfait,
);

// TODO: Paket Yönetimi Route'ları (Daha önce vardı, geri eklenebilir)

// TODO: Kredi Yönetimi route'ları

// TODO: Raporlama route'ları

module.exports = router;
