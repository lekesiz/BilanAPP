const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Subscription extends Model {}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the subscription',
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'cancelled', 'expired', 'suspended', 'trial', 'grace_period', 'payment_failed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the subscription',
    },
    type: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'custom', 'trial', 'lifetime'),
      allowNull: false,
      comment: 'Type of subscription',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Start date of the subscription',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date of the subscription',
    },
    trialEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date of the trial period',
    },
    gracePeriodEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date of the grace period',
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the subscription auto-renews',
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'bank_transfer', 'paypal', 'other'),
      allowNull: true,
      comment: 'Payment method for the subscription',
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'custom'),
      allowNull: false,
      defaultValue: 'monthly',
      comment: 'Billing cycle of the subscription',
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Next billing date',
    },
    lastBillingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last billing date',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the subscription',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          notes: '',
          features: [],
          limits: {
            users: null,
            storage: null,
            apiCalls: null,
            custom: {}
          },
          settings: {
            notifications: true,
            autoUpgrade: false,
            custom: {}
          },
          history: {
            upgrades: [],
            downgrades: [],
            cancellations: []
          },
          statistics: {
            totalPaid: 0,
            lastPaymentAmount: 0,
            averagePaymentAmount: 0,
            paymentCount: 0
          }
        };
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Tags associated with the subscription',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who owns the subscription',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    forfaitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the subscribed forfait',
      references: {
        model: 'Forfaits',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the subscription was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the subscription',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the subscription is active',
    },
    cancellationReason: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reason for cancellation if applicable',
    },
    cancellationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the subscription was cancelled',
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['forfaitId'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
      {
        fields: ['trialEndDate'],
      },
      {
        fields: ['gracePeriodEndDate'],
      },
      {
        fields: ['nextBillingDate'],
      },
      {
        fields: ['lastBillingDate'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['userId', 'status'],
      },
      {
        fields: ['forfaitId', 'status'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['paymentMethod'],
      },
      {
        fields: ['billingCycle'],
      },
      {
        fields: ['status', 'isActive'],
      },
      {
        fields: ['type', 'billingCycle'],
      },
    ],
    hooks: {
      beforeCreate: async (subscription) => {
        subscription.lastModifiedAt = new Date();
        if (!subscription.metadata) {
          subscription.metadata = {
            description: '',
            notes: '',
            features: [],
            limits: {
              users: null,
              storage: null,
              apiCalls: null,
              custom: {}
            },
            settings: {
              notifications: true,
              autoUpgrade: false,
              custom: {}
            },
            history: {
              upgrades: [],
              downgrades: [],
              cancellations: []
            },
            statistics: {
              totalPaid: 0,
              lastPaymentAmount: 0,
              averagePaymentAmount: 0,
              paymentCount: 0
            }
          };
        }
        if (!subscription.tags) {
          subscription.tags = [];
        }
      },
      beforeUpdate: async (subscription) => {
        subscription.lastModifiedAt = new Date();
        if (subscription.changed('status') || subscription.changed('endDate') || subscription.changed('forfaitId')) {
          subscription.version += 1;
        }
      },
    },
  },
);

Subscription.associate = function(models) {
  Subscription.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Subscription.belongsTo(models.Forfait, {
    foreignKey: 'forfaitId',
    as: 'forfait',
    onDelete: 'CASCADE',
  });
  Subscription.hasMany(models.Payment, {
    foreignKey: 'subscriptionId',
    as: 'payments',
    onDelete: 'SET NULL',
  });
};

module.exports = Subscription; 