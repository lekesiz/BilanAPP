const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Forfait extends Model {}

Forfait.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the forfait',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Name of the forfait package',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the forfait package',
    },
    defaultCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Default number of credits included',
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Features included in the package',
      get() {
        const rawValue = this.getDataValue('features');
        return rawValue ? JSON.parse(rawValue) : {
          ai: {
            generations: {
              monthly: null,
              daily: null,
              hourly: null
            },
            models: [],
            capabilities: []
          },
          storage: {
            space: null,
            fileTypes: [],
            maxFileSize: null
          },
          beneficiaries: {
            max: null,
            fields: [],
            customFields: []
          },
          support: {
            level: 'basic',
            channels: [],
            responseTime: null
          },
          api: {
            enabled: false,
            rateLimit: null,
            endpoints: []
          },
          security: {
            twoFactor: false,
            sso: false,
            auditLogs: false
          },
          customization: {
            branding: false,
            themes: false,
            customDomain: false
          }
        };
      },
      set(value) {
        this.setDataValue('features', JSON.stringify(value || {}));
      },
    },
    maxBeneficiaries: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum number of beneficiaries allowed (null for unlimited)',
    },
    maxAiGenerationsMonthly: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum AI generations allowed per month (null for unlimited)',
    },
    maxAiGenerationsDaily: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum AI generations allowed per day (null for unlimited)',
    },
    maxAiGenerationsHourly: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum AI generations allowed per hour (null for unlimited)',
    },
    maxStorageSpace: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum storage space in MB (null for unlimited)',
    },
    maxFileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Maximum file size in MB (null for unlimited)',
    },
    allowedFileTypes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Allowed file types',
      get() {
        const rawValue = this.getDataValue('allowedFileTypes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('allowedFileTypes', JSON.stringify(value || []));
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived', 'deleted', 'draft', 'scheduled', 'expired'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the forfait package',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Price of the forfait package',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
      comment: 'Currency of the price',
    },
    validityPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Validity period in days',
    },
    trialPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Trial period in days (null if no trial)',
    },
    trialCredits: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of credits included in trial period',
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the forfait auto-renews',
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is a popular forfait',
    },
    isRecommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is a recommended forfait',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order in which to display the forfait',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the forfait',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          notes: '',
          terms: '',
          features: [],
          limitations: [],
          requirements: [],
          pricing: {
            monthly: 0,
            yearly: 0,
            lifetime: 0,
            currency: 'EUR'
          },
          statistics: {
            totalSubscribers: 0,
            activeSubscribers: 0,
            averageRating: 0,
            totalReviews: 0
          },
          history: {
            priceChanges: [],
            featureChanges: [],
            statusChanges: []
          },
          customFields: {}
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
      comment: 'Tags associated with the forfait',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the forfait',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the forfait was last modified',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who created the forfait',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last modified the forfait',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Forfait',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['status'],
      },
      {
        fields: ['price'],
      },
      {
        fields: ['autoRenew'],
      },
      {
        fields: ['isPopular'],
      },
      {
        fields: ['isRecommended'],
      },
      {
        fields: ['displayOrder'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['createdBy'],
      },
      {
        fields: ['lastModifiedBy'],
      },
      {
        fields: ['deletedAt'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
      {
        fields: ['status', 'price'],
      },
      {
        fields: ['status', 'autoRenew'],
      },
      {
        fields: ['status', 'isPopular'],
      },
      {
        fields: ['status', 'isRecommended'],
      },
      {
        fields: ['price', 'currency'],
      },
      {
        fields: ['validityPeriod', 'status'],
      },
      {
        fields: ['trialPeriod', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (forfait) => {
        forfait.lastModifiedAt = new Date();
        if (!forfait.features) {
          forfait.features = {
            ai: {
              generations: {
                monthly: null,
                daily: null,
                hourly: null
              },
              models: [],
              capabilities: []
            },
            storage: {
              space: null,
              fileTypes: [],
              maxFileSize: null
            },
            beneficiaries: {
              max: null,
              fields: [],
              customFields: []
            },
            support: {
              level: 'basic',
              channels: [],
              responseTime: null
            },
            api: {
              enabled: false,
              rateLimit: null,
              endpoints: []
            },
            security: {
              twoFactor: false,
              sso: false,
              auditLogs: false
            },
            customization: {
              branding: false,
              themes: false,
              customDomain: false
            }
          };
        }
        if (!forfait.metadata) {
          forfait.metadata = {
            description: '',
            notes: '',
            terms: '',
            features: [],
            limitations: [],
            requirements: [],
            pricing: {
              monthly: 0,
              yearly: 0,
              lifetime: 0,
              currency: 'EUR'
            },
            statistics: {
              totalSubscribers: 0,
              activeSubscribers: 0,
              averageRating: 0,
              totalReviews: 0
            },
            history: {
              priceChanges: [],
              featureChanges: [],
              statusChanges: []
            },
            customFields: {}
          };
        }
        if (!forfait.tags) {
          forfait.tags = [];
        }
        if (!forfait.allowedFileTypes) {
          forfait.allowedFileTypes = [];
        }
      },
      beforeUpdate: async (forfait) => {
        forfait.lastModifiedAt = new Date();
        if (
          forfait.changed('features') ||
          forfait.changed('price') ||
          forfait.changed('status') ||
          forfait.changed('maxBeneficiaries') ||
          forfait.changed('maxAiGenerationsMonthly') ||
          forfait.changed('maxAiGenerationsDaily') ||
          forfait.changed('maxAiGenerationsHourly') ||
          forfait.changed('maxStorageSpace') ||
          forfait.changed('maxFileSize') ||
          forfait.changed('allowedFileTypes')
        ) {
          forfait.version += 1;
        }
      },
    },
  },
);

Forfait.associate = function(models) {
  Forfait.hasMany(models.User, {
    foreignKey: 'forfaitType',
    as: 'users',
    onDelete: 'SET NULL',
  });
  
  Forfait.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
    onDelete: 'SET NULL',
  });
  
  Forfait.belongsTo(models.User, {
    foreignKey: 'lastModifiedBy',
    as: 'modifier',
    onDelete: 'SET NULL',
  });
};

module.exports = Forfait;
