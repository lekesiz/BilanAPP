const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM('consultant', 'beneficiary'),
      allowNull: false,
    },
    forfaitType: {
      type: DataTypes.ENUM('Essentiel', 'Standard', 'Premium', 'Entreprise', 'Admin'),
      allowNull: true,
      defaultValue: 'Standard',
    },
    availableCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // AI Kullanım Sayacı ve Sıfırlama Tarihi
    aiGenerationsThisMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of AI generations used in the current month',
    },
    aiGenerationCountResetDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date when the AI generation counter was last reset (typically 1st of month)',
    },
  },
  {
    sequelize,
    modelName: 'User',
    // Re-enable hooks now that login issue is resolved
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt); // Ensure this uses bcryptjs
        }
      },
      beforeUpdate: async (user) => {
        // Only hash password if it has changed
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt); // Ensure this uses bcryptjs
        }
      },
    },
  },
);

module.exports = User;
