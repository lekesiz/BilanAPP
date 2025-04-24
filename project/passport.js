const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
  // Stratégie locale
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });

          if (!user) {
            return done(null, false, { message: 'Email non trouvé' });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: 'Mot de passe incorrect' });
          }

          return done(null, user);
        } catch (err) {
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
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
