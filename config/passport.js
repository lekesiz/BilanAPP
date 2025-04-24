const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = () => {
  // Stratégie locale
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          // console.log(`[PASSPORT DEBUG] Attempting login for email: ${email}`);
          const user = await User.findOne({ where: { email } });

          if (!user) {
            // console.log(`[PASSPORT DEBUG] User not found for email: ${email}`);
            return done(null, false, {
              message: "Cet email n'est pas enregistré.",
            });
          }

          // console.log(`[PASSPORT DEBUG] User found. Comparing password for user ID: ${user.id}`);
          // console.log(`[PASSPORT DEBUG] Plain password received (length ${password?.length}): ${password}`);
          // console.log(`[PASSPORT DEBUG] Hashed password from DB (length ${user?.password?.length}): ${user.password}`);

          const isMatch = await bcrypt.compare(password, user.password);

          // console.log(`[PASSPORT DEBUG] bcrypt.compare result (isMatch): ${isMatch}`);

          if (isMatch) {
            // console.log(`[PASSPORT DEBUG] Login successful for user ID: ${user.id}`);
            return done(null, user);
          }
          // console.log(`[PASSPORT DEBUG] Password mismatch for user ID: ${user.id}`);
          return done(null, false, { message: 'Mot de passe incorrect.' });
        } catch (err) {
          console.error('[PASSPORT DEBUG] Error during authentication:', err);
          return done(err);
        }
      },
    ),
  );

  // Sérialisation/désérialisation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log(`[PASSPORT DESERIALIZE] Attempting to deserialize user with ID: ${id}`);
      const user = await User.findByPk(id);
      if (user) {
        console.log(`[PASSPORT DESERIALIZE] User found: ${user.email}, Type: ${user.userType}`);
        done(null, user);
      } else {
        console.error(`[PASSPORT DESERIALIZE] User with ID ${id} not found.`);
        done(null, false);
      }
    } catch (err) {
      console.error('[PASSPORT DESERIALIZE] Error during deserialization:', err);
      done(err);
    }
  });
};
