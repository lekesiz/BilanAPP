const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the payment',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Payment amount',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
      comment: 'Payment currency',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'disputed', 'chargeback', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the payment',
    },
    type: {
      type: DataTypes.ENUM('subscription', 'one_time', 'refund', 'credit', 'dispute', 'chargeback', 'adjustment', 'other'),
      allowNull: false,
      comment: 'Type of payment',
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Payment provider (stripe, paypal, etc.)',
    },
    providerPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Payment ID from the provider',
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay', 'other'),
      allowNull: false,
      comment: 'Payment method used',
    },
    paymentMethodDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Details about the payment method',
      get() {
        const rawValue = this.getDataValue('paymentMethodDetails');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('paymentMethodDetails', JSON.stringify(value || {}));
      },
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Amount refunded (if applicable)',
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reason for refund (if applicable)',
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reason for failure (if applicable)',
    },
    failureCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Error code for failure (if applicable)',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the payment',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          notes: '',
          invoiceNumber: null,
          invoiceDate: null,
          dueDate: null,
          taxAmount: 0,
          discountAmount: 0,
          shippingAmount: 0,
          billingAddress: {},
          shippingAddress: {},
          items: [],
          customFields: {},
          history: {
            statusChanges: [],
            refunds: [],
            disputes: [],
            chargebacks: []
          },
          statistics: {
            totalRefunded: 0,
            refundCount: 0,
            disputeCount: 0,
            chargebackCount: 0
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
      comment: 'Tags associated with the payment',
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
      comment: 'ID of the user who made the payment',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the related subscription (if applicable)',
      references: {
        model: 'Subscriptions',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the payment was processed',
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the payment was refunded',
    },
    disputedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the payment was disputed',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the payment was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the payment',
    },
  },
  {
    sequelize,
    modelName: 'Payment',
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
        fields: ['provider'],
      },
      {
        fields: ['providerPaymentId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['subscriptionId'],
      },
      {
        fields: ['processedAt'],
      },
      {
        fields: ['refundedAt'],
      },
      {
        fields: ['disputedAt'],
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
        fields: ['subscriptionId', 'status'],
      },
      {
        fields: ['paymentMethod'],
      },
      {
        fields: ['status', 'processedAt'],
      },
      {
        fields: ['status', 'refundedAt'],
      },
      {
        fields: ['status', 'disputedAt'],
      },
    ],
    hooks: {
      beforeCreate: async (payment) => {
        payment.lastModifiedAt = new Date();
        if (!payment.metadata) {
          payment.metadata = {
            description: '',
            notes: '',
            invoiceNumber: null,
            invoiceDate: null,
            dueDate: null,
            taxAmount: 0,
            discountAmount: 0,
            shippingAmount: 0,
            billingAddress: {},
            shippingAddress: {},
            items: [],
            customFields: {},
            history: {
              statusChanges: [],
              refunds: [],
              disputes: [],
              chargebacks: []
            },
            statistics: {
              totalRefunded: 0,
              refundCount: 0,
              disputeCount: 0,
              chargebackCount: 0
            }
          };
        }
        if (!payment.tags) {
          payment.tags = [];
        }
      },
      beforeUpdate: async (payment) => {
        payment.lastModifiedAt = new Date();
        if (payment.changed('status') || payment.changed('amount') || payment.changed('refundAmount')) {
          payment.version += 1;
        }
      },
    },
  },
);

Payment.associate = function(models) {
  Payment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Payment.belongsTo(models.Subscription, {
    foreignKey: 'subscriptionId',
    as: 'subscription',
    onDelete: 'SET NULL',
  });
};

module.exports = Payment; 