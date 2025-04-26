const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('@models/user');
const logger = require('./logger');

module.exports = function(passport) {
  // Stratégie locale
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      logger.debug(`[PASSPORT] Attempting login for email: ${email}`);
      try {
        // E-posta kontrolü
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          logger.warn(`[PASSPORT] User not found for email: ${email}`);
          return done(null, false, { message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          logger.warn(`[PASSPORT] Password mismatch for user ID: ${user.id}, Email: ${email}`);
          return done(null, false, { message: 'Hatalı şifre.' });
        }

        // Kullanıcı durumu kontrolü
        if (user.status !== 'active') {
          logger.warn(`[PASSPORT] User account is not active for user ID: ${user.id}, Email: ${email}`);
          return done(null, false, { message: 'Hesabınız aktif değil.' });
        }

        // Başarılı giriş
        logger.info(`[PASSPORT] Login successful for user ID: ${user.id}, Email: ${email}`);
        return done(null, user);
      } catch (err) {
        logger.error('[PASSPORT] Error during authentication:', { error: err, email });
        return done(err);
      }
    })
  );

  // Sérialisation/désérialisation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    logger.debug(`[PASSPORT DESERIALIZE] Attempting to deserialize user with ID: ${id}`);
    try {
      const user = await User.findById(id);
      if (user) {
        logger.debug(`[PASSPORT DESERIALIZE] User found: ${user.email}, Type: ${user.userType}`);
        done(null, user);
      } else {
        logger.error(`[PASSPORT DESERIALIZE] User with ID ${id} not found.`);
        done(null, false);
      }
    } catch (err) {
      logger.error('[PASSPORT DESERIALIZE] Error during deserialization:', { error: err, userId: id });
      done(err);
    }
  });
};
