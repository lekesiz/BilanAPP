const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DocumentVersion extends Model {}

DocumentVersion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Documents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('major', 'minor', 'patch', 'rollback', 'merge'),
      defaultValue: 'minor',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived'),
      defaultValue: 'draft',
      allowNull: false,
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('changes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('changes', JSON.stringify(value));
      },
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
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false,
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
      onDelete: 'SET NULL',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DocumentVersion',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['versionNumber'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['isPublic'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['documentId', 'versionNumber'],
        unique: true,
      },
      {
        fields: ['documentId', 'status'],
      },
      {
        fields: ['documentId', 'type'],
      },
      {
        fields: ['lastModifiedAt'],
      },
    ],
    hooks: {
      beforeCreate: async (version) => {
        version.lastModifiedAt = new Date();
        if (!version.metadata) {
          version.metadata = {
            description: '',
            notes: '',
            customFields: {},
            history: {
              statusChanges: [],
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
        if (!version.tags) {
          version.tags = [];
        }
        if (!version.changes) {
          version.changes = [];
        }
      },
      beforeUpdate: async (version) => {
        version.lastModifiedAt = new Date();
        if (
          version.changed('status') ||
          version.changed('changes') ||
          version.changed('metadata')
        ) {
          const document = await version.getDocument();
          if (document) {
            document.version += 1;
            await document.save();
          }
        }
      },
    },
  },
);

DocumentVersion.associate = function(models) {
  DocumentVersion.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'document',
    onDelete: 'CASCADE',
  });
  
  DocumentVersion.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
  
  DocumentVersion.hasMany(models.DocumentAccess, {
    foreignKey: 'versionId',
    as: 'accesses',
    onDelete: 'CASCADE',
  });
};

module.exports = DocumentVersion; 