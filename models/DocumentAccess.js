const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DocumentAccess extends Model {}

DocumentAccess.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    accessType: {
      type: DataTypes.ENUM('read', 'write', 'admin', 'share', 'download', 'print', 'comment'),
      allowNull: false,
      defaultValue: 'read',
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'revoked', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRecursive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    restrictions: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('restrictions');
        return rawValue ? JSON.parse(rawValue) : {
          allowedHours: [],
          allowedDays: [],
          allowedIPs: [],
          maxDownloads: null,
          maxViews: null,
          watermark: false,
          printLimit: null,
          downloadLimit: null,
          expirationDate: null,
          requireAuthentication: true,
          require2FA: false,
          allowedDevices: [],
          allowedLocations: [],
          customRules: []
        };
      },
      set(value) {
        this.setDataValue('restrictions', JSON.stringify(value));
      },
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
            accessLogs: [],
            statusChanges: [],
            permissionChanges: []
          },
          statistics: {
            totalAccesses: 0,
            totalDownloads: 0,
            totalViews: 0,
            totalPrints: 0,
            totalShares: 0,
            averageSessionDuration: 0
          },
          security: {
            lastSecurityCheck: null,
            securityScore: 0,
            riskLevel: 'low',
            suspiciousActivities: [],
            complianceChecks: []
          },
          permissions: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canShare: false,
            canDownload: false,
            canPrint: false,
            canComment: false,
            customPermissions: []
          },
          restrictions: {
            timeBased: [],
            locationBased: [],
            deviceBased: [],
            contentBased: [],
            customRestrictions: []
          }
        };
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value));
      },
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DocumentAccess',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['documentId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['accessType'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['expiresAt'],
      },
      {
        fields: ['lastAccessedAt'],
      },
      {
        fields: ['documentId', 'userId', 'accessType'],
        unique: true,
      },
      {
        fields: ['documentId', 'status'],
      },
      {
        fields: ['userId', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (access) => {
        access.lastModifiedAt = new Date();
        if (!access.metadata) {
          access.metadata = {
            description: '',
            notes: '',
            customFields: {},
            history: {
              accessLogs: [],
              statusChanges: [],
              permissionChanges: []
            },
            statistics: {
              totalAccesses: 0,
              totalDownloads: 0,
              totalViews: 0,
              totalPrints: 0,
              totalShares: 0,
              averageSessionDuration: 0
            },
            security: {
              lastSecurityCheck: null,
              securityScore: 0,
              riskLevel: 'low',
              suspiciousActivities: [],
              complianceChecks: []
            },
            permissions: {
              canView: true,
              canEdit: false,
              canDelete: false,
              canShare: false,
              canDownload: false,
              canPrint: false,
              canComment: false,
              customPermissions: []
            },
            restrictions: {
              timeBased: [],
              locationBased: [],
              deviceBased: [],
              contentBased: [],
              customRestrictions: []
            }
          };
        }
        if (!access.restrictions) {
          access.restrictions = {
            allowedHours: [],
            allowedDays: [],
            allowedIPs: [],
            maxDownloads: null,
            maxViews: null,
            watermark: false,
            printLimit: null,
            downloadLimit: null,
            expirationDate: null,
            requireAuthentication: true,
            require2FA: false,
            allowedDevices: [],
            allowedLocations: [],
            customRules: []
          };
        }
      },
      beforeUpdate: async (access) => {
        access.lastModifiedAt = new Date();
        if (access.changed('status') || access.changed('accessType')) {
          const metadata = access.metadata;
          metadata.history.statusChanges.push({
            date: new Date(),
            oldStatus: access.previous('status'),
            newStatus: access.status,
            oldAccessType: access.previous('accessType'),
            newAccessType: access.accessType,
            changedBy: access.userId
          });
          access.metadata = metadata;
        }
      },
    },
  },
);

DocumentAccess.associate = function(models) {
  DocumentAccess.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'document',
    onDelete: 'CASCADE',
  });
  
  DocumentAccess.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
};

module.exports = DocumentAccess; 