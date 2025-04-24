const { User, CreditLog, Forfait } = require('../models');

/**
 * Kullanıcının kredisini kontrol eder ve belirtilen miktarı düşer.
 * @param {number} userId Kredisi düşülecek kullanıcının ID'si.
 * @param {number} amount Düşülecek kredi miktarı.
 * @returns {Promise<{success: boolean, message?: string}>} İşlem sonucu.
 */
async function deductCredits(userId, amount) {
  if (amount <= 0) {
    return { success: true }; // Düşülecek miktar 0 veya negatifse işlem başarılı.
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false, message: 'Kullanıcı bulunamadı.' };
    }

    // Admin tipi kullanıcılar için kredi kontrolünü atla (veya farklı bir mantık uygula)
    if (user.forfaitType === 'Admin') {
      return { success: true }; // Adminler için kredi düşme
    }

    if (user.availableCredits < amount) {
      return {
        success: false,
        message: `Yetersiz kredi. Bu işlem için ${amount} kredi gereklidir. Mevcut kredi: ${user.availableCredits}`,
      };
    }

    // Krediyi düş
    user.availableCredits -= amount;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error('Credit deduction error:', error);
    return {
      success: false,
      message: 'Kredi düşülürken bir sunucu hatası oluştu.',
    };
  }
}

/**
 * Kredi değişikliğini loglar.
 * @param {number} userId Kullanıcı ID.
 * @param {number} amount Değişen kredi miktarı (pozitif veya negatif).
 * @param {string} action İşlem türü (örn: 'ADMIN_ADJUSTMENT', 'CREDIT_PURCHASE').
 * @param {string} [description] İşlem açıklaması.
 * @param {number} [adminUserId] İşlemi yapan adminin ID'si (opsiyonel).
 * @param {number} [relatedResourceId]
 * @param {string} [relatedResourceType]
 */
async function logCreditChange(
  userId,
  amount,
  action,
  description = null,
  adminUserId = null,
  relatedResourceId = null,
  relatedResourceType = null,
) {
  try {
    // Admin ID'sini açıklamaya ekleyebiliriz
    let finalDescription = description;
    if (adminUserId) {
      finalDescription = description
        ? `${description} (par Admin ID: ${adminUserId})`
        : `Ajustement par Admin ID: ${adminUserId}`;
    }

    await CreditLog.create({
      userId,
      amount, // Pozitif veya negatif olabilir
      action,
      description: finalDescription,
      relatedResourceId,
      relatedResourceType,
      adminUserId,
    });
    console.log(`Credit change logged for user ${userId}: ${amount} credits for ${action}`);
  } catch (error) {
    console.error('Error logging credit change:', error);
  }
}

// Paket tipine göre varsayılan krediyi GETİRME fonksiyonu (DB'den)
async function getDefaultCreditsForForfait(forfaitType) {
  if (!forfaitType) {
    // Varsayılan olarak 'Standard' paketinin kredisini döndür
    const standardForfait = await Forfait.findByPk('Standard');
    return standardForfait ? standardForfait.defaultCredits : 0; // Standard yoksa 0 döndür
  }
  const forfait = await Forfait.findByPk(forfaitType);
  return forfait ? forfait.defaultCredits : 0; // Paket bulunamazsa 0 döndür
}

module.exports = {
  deductCredits,
  logCreditChange,
  getDefaultCreditsForForfait,
};
