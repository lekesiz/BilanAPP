const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const logger = require('./logger');

module.exports = () => {
  // Stratégie locale
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      logger.debug(`[PASSPORT] Attempting login for email: ${email}`);
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          logger.warn(`[PASSPORT] User not found for email: ${email}`);
          return done(null, false, {
            message: "Cet email n'est pas enregistré.",
          });
        }

        logger.debug(`[PASSPORT] User found. Comparing password for user ID: ${user.id}`);
        const isMatch = await bcrypt.compare(password, user.password);
        logger.debug(`[PASSPORT] bcrypt.compare result (isMatch): ${isMatch}`);

        if (isMatch) {
          logger.info(`[PASSPORT] Login successful for user ID: ${user.id}, Email: ${email}`);
          return done(null, user);
        }
        logger.warn(`[PASSPORT] Password mismatch for user ID: ${user.id}, Email: ${email}`);
        return done(null, false, { message: 'Mot de passe incorrect.' });
      } catch (err) {
        logger.error('[PASSPORT] Error during authentication:', { error: err, email });
        return done(err);
      }
    }),
  );

  // Sérialisation/désérialisation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    logger.debug(`[PASSPORT DESERIALIZE] Attempting to deserialize user with ID: ${id}`);
    try {
      const user = await User.findByPk(id);
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
