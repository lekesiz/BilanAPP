const { Model, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const logger = require('../config/logger');

class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('resume', 'cover_letter', 'certificate', 'reference', 'portfolio', 'assessment', 'report', 'contract', 'agreement', 'other'),
      defaultValue: 'other',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived', 'deleted', 'expired', 'suspended'),
      defaultValue: 'draft',
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Documents',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          notes: '',
          customFields: {},
          history: {
            statusChanges: [],
            versionChanges: [],
            accessChanges: [],
            contentChanges: [],
            activityHistory: []
          },
          statistics: {
            totalViews: 0,
            totalDownloads: 0,
            totalShares: 0,
            totalEdits: 0,
            averageRating: 0
          },
          security: {
            accessLogs: [],
            permissions: {
              read: [],
              write: [],
              share: [],
              delete: []
            },
            encryption: {
              algorithm: null,
              key: null,
              lastEncrypted: null
            }
          },
          content: {
            language: 'en',
            keywords: [],
            categories: [],
            tags: [],
            summary: '',
            sections: []
          },
          validation: {
            lastValidated: null,
            validationRules: [],
            validationResults: [],
            requiredFields: []
          }
        };
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value));
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value));
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    explorationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CareerExplorations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Document',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['explorationId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['fileType'],
      },
      {
        fields: ['mimeType'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['isPublic'],
      },
      {
        fields: ['isTemplate'],
      },
      {
        fields: ['templateId'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['lastAccessedAt'],
      },
      {
        fields: ['expiresAt'],
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['userId', 'type'],
      },
      {
        fields: ['beneficiaryId', 'type'],
      },
      {
        fields: ['explorationId', 'type'],
      },
      {
        fields: ['lastModifiedAt', 'status'],
      },
      {
        fields: ['expiresAt', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (document) => {
        document.lastModifiedAt = new Date();
        if (!document.metadata) {
          document.metadata = {
            description: '',
            notes: '',
            customFields: {},
            history: {
              statusChanges: [],
              versionChanges: [],
              accessChanges: [],
              contentChanges: [],
              activityHistory: []
            },
            statistics: {
              totalViews: 0,
              totalDownloads: 0,
              totalShares: 0,
              totalEdits: 0,
              averageRating: 0
            },
            security: {
              accessLogs: [],
              permissions: {
                read: [],
                write: [],
                share: [],
                delete: []
              },
              encryption: {
                algorithm: null,
                key: null,
                lastEncrypted: null
              }
            },
            content: {
              language: 'en',
              keywords: [],
              categories: [],
              tags: [],
              summary: '',
              sections: []
            },
            validation: {
              lastValidated: null,
              validationRules: [],
              validationResults: [],
              requiredFields: []
            }
          };
        }
        if (!document.tags) {
          document.tags = [];
        }
      },
      beforeUpdate: async (document) => {
        document.lastModifiedAt = new Date();
        if (
          document.changed('status') ||
          document.changed('version') ||
          document.changed('metadata')
        ) {
          document.version += 1;
        }
      },
      afterDestroy: async (document) => {
        if (document.filePath && document.storageType === 'local') {
          const fullPath = path.join(__dirname, '../public/uploads', document.filePath);
          logger.info(`[Hook afterDestroy] Attempting to delete file: ${fullPath}`);
          try {
            await fs.promises.unlink(fullPath);
            logger.info(`[Hook afterDestroy] Successfully deleted file: ${fullPath}`);
          } catch (err) {
            if (err.code === 'ENOENT') {
              logger.warn(`[Hook afterDestroy] File not found for deletion (ENOENT): ${fullPath}`);
            } else {
              logger.error(`[Hook afterDestroy] Error deleting file ${fullPath}:`, err);
              throw err;
            }
          }
        } else {
          logger.warn(`[Hook afterDestroy] Document ID ${document.id} destroyed, but no filePath found or not local storage.`);
        }
      },
    },
  },
);

Document.associate = function(models) {
  Document.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  
  Document.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'CASCADE',
  });
  
  Document.belongsTo(models.CareerExploration, {
    foreignKey: 'explorationId',
    as: 'exploration',
    onDelete: 'CASCADE',
  });
  
  Document.belongsTo(models.Document, {
    foreignKey: 'templateId',
    as: 'template',
    onDelete: 'SET NULL',
  });
  
  Document.hasMany(models.DocumentVersion, {
    foreignKey: 'documentId',
    as: 'versions',
    onDelete: 'CASCADE',
  });
  
  Document.hasMany(models.DocumentAccess, {
    foreignKey: 'documentId',
    as: 'accesses',
    onDelete: 'CASCADE',
  });
};

module.exports = Document;
