// const { Op } = require('sequelize'); // Kullanılmadığı için kaldırıldı
const { User, Forfait } = require('../models');

/**
 * Kullanıcının aylık AI oluşturma limitini kontrol eder.
 * Gerekirse sayacı sıfırlar.
 * @param {number} userId Kontrol edilecek kullanıcı ID'si.
 * @returns {Promise<{allowed: boolean, message?: string, limit?: number|null, currentUsage?: number}>}
 */
async function checkAiLimit(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: { model: Forfait, as: 'forfait' },
    });

    if (!user || !user.forfait) {
      return { allowed: false, message: 'Forfait bilgisi bulunamadı.' };
    }

    const limit = user.forfait.maxAiGenerationsMonthly;
    // Limit null ise (sınırsız) veya 0 ise (hiç izin yok - Essentiel gibi), kontrolü yap
    if (limit === null) {
      return {
        allowed: true,
        limit: null,
        currentUsage: user.aiGenerationsThisMonth,
      }; // Sınırsız izin
    }
    if (limit === 0) {
      return {
        allowed: false,
        message: 'Bu özellik mevcut forfaitınızda bulunmamaktadır.',
        limit: 0,
        currentUsage: 0,
      };
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const resetDate = user.aiGenerationCountResetDate ?
      new Date(user.aiGenerationCountResetDate) :
      null;
    let usageCount = user.aiGenerationsThisMonth;

    // Sayacı sıfırlama kontrolü
    if (
      !resetDate ||
      resetDate.getFullYear() < currentYear ||
      (resetDate.getFullYear() === currentYear && resetDate.getMonth() < currentMonth)
    ) {
      console.log(`Resetting AI count for user ${userId}`);
      usageCount = 0;
      try {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        await user.update({
          aiGenerationsThisMonth: 0,
          aiGenerationCountResetDate: firstDayOfMonth,
        });
        console.log(`AI count reset SUCCESS for user ${userId}`);
      } catch (updateError) {
        console.error(`Error updating user AI count for reset (user ${userId}):`, updateError);
        // Sayacı sıfırlayamasak bile limit kontrolüne devam edelim mi?
        // Şimdilik edelim, ama hata mesajı verebiliriz.
        // Belki de burada false dönmek daha güvenli olur?
        // Şimdilik devam et, ama hata mesajı loglandı.
      }
    }

    // Limiti kontrol et
    if (usageCount >= limit) {
      return {
        allowed: false,
        message: `Aylık ${limit} AI oluşturma limitinize ulaştınız.`,
        limit,
        currentUsage: usageCount,
      };
    }

    // İzin verildi
    return { allowed: true, limit, currentUsage: usageCount };
  } catch (error) {
    console.error('Error checking AI limit:', error);
    return {
      allowed: false,
      message: 'AI limit kontrolü sırasında bir hata oluştu.',
    };
  }
}

/**
 * Kullanıcının AI kullanım sayacını artırır.
 * @param {number} userId Kullanıcı ID'si.
 */
async function incrementAiUsage(userId) {
  try {
    await User.increment('aiGenerationsThisMonth', { where: { id: userId } });
    console.log(`Incremented AI count for user ${userId}`);
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
    // Bu hatayı nasıl yöneteceğiz? Şimdilik sadece loglayalım.
  }
}

module.exports = {
  checkAiLimit,
  incrementAiUsage,
};
