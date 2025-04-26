const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CareerExploration extends Model {}

CareerExploration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    consultantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'reviewed', 'archived', 'deleted', 'pending', 'rejected', 'suspended'),
      defaultValue: 'draft',
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('self_assessment', 'market_research', 'skill_analysis', 'interest_exploration', 'education_path', 'career_path', 'job_search', 'networking', 'interview_prep', 'resume_review'),
      defaultValue: 'self_assessment',
      allowNull: false,
    },
    explorationData: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('explorationData');
        return rawValue ? JSON.parse(rawValue) : {
          assessment: {
            skills: [],
            interests: [],
            values: [],
            personality: {},
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          },
          research: {
            industries: [],
            companies: [],
            roles: [],
            salaries: [],
            requirements: [],
            trends: [],
            resources: []
          },
          analysis: {
            skillGaps: [],
            trainingNeeds: [],
            certificationPaths: [],
            educationOptions: [],
            careerPaths: [],
            timeline: {
              shortTerm: [],
              mediumTerm: [],
              longTerm: []
            }
          },
          planning: {
            goals: {
              shortTerm: [],
              mediumTerm: [],
              longTerm: []
            },
            actionSteps: [],
            resources: {
              courses: [],
              certifications: [],
              networking: [],
              mentoring: []
            },
            timeline: {
              startDate: null,
              endDate: null,
              milestones: []
            }
          },
          progress: {
            completedSteps: [],
            currentStep: null,
            nextSteps: [],
            challenges: [],
            achievements: []
          },
          evaluation: {
            metrics: [],
            checkpoints: [],
            feedback: []
          }
        };
      },
      set(value) {
        this.setDataValue('explorationData', JSON.stringify(value));
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
            statusChanges: [],
            typeChanges: [],
            consultantChanges: [],
            documentChanges: [],
            activityHistory: []
          },
          statistics: {
            totalAssessments: 0,
            totalResearch: 0,
            totalAnalysis: 0,
            totalPlanning: 0,
            totalProgress: 0,
            totalEvaluation: 0
          },
          preferences: {
            communication: {
              preferredMethod: 'email',
              preferredTime: 'business_hours',
              language: 'en'
            },
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          },
          security: {
            accessLogs: [],
            documentAccess: [],
            lastReview: null
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
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
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
        model: 'CareerExplorations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'CareerExploration',
    indexes: [
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['consultantId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['isTemplate'],
      },
      {
        fields: ['templateId'],
      },
      {
        fields: ['status', 'type'],
      },
      {
        fields: ['consultantId', 'status'],
      },
      {
        fields: ['consultantId', 'type'],
      },
      {
        fields: ['startDate', 'status'],
      },
      {
        fields: ['endDate', 'status'],
      },
      {
        fields: ['priority', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (exploration) => {
        exploration.lastModifiedAt = new Date();
        if (!exploration.explorationData) {
          exploration.explorationData = {
            assessment: {
              skills: [],
              interests: [],
              values: [],
              personality: {},
              strengths: [],
              weaknesses: [],
              opportunities: [],
              threats: []
            },
            research: {
              industries: [],
              companies: [],
              roles: [],
              salaries: [],
              requirements: [],
              trends: [],
              resources: []
            },
            analysis: {
              skillGaps: [],
              trainingNeeds: [],
              certificationPaths: [],
              educationOptions: [],
              careerPaths: [],
              timeline: {
                shortTerm: [],
                mediumTerm: [],
                longTerm: []
              }
            },
            planning: {
              goals: {
                shortTerm: [],
                mediumTerm: [],
                longTerm: []
              },
              actionSteps: [],
              resources: {
                courses: [],
                certifications: [],
                networking: [],
                mentoring: []
              },
              timeline: {
                startDate: null,
                endDate: null,
                milestones: []
              }
            },
            progress: {
              completedSteps: [],
              currentStep: null,
              nextSteps: [],
              challenges: [],
              achievements: []
            },
            evaluation: {
              metrics: [],
              checkpoints: [],
              feedback: []
            }
          };
        }
        if (!exploration.metadata) {
          exploration.metadata = {
            description: '',
            notes: '',
            customFields: {},
            history: {
              statusChanges: [],
              typeChanges: [],
              consultantChanges: [],
              documentChanges: [],
              activityHistory: []
            },
            statistics: {
              totalAssessments: 0,
              totalResearch: 0,
              totalAnalysis: 0,
              totalPlanning: 0,
              totalProgress: 0,
              totalEvaluation: 0
            },
            preferences: {
              communication: {
                preferredMethod: 'email',
                preferredTime: 'business_hours',
                language: 'en'
              },
              notifications: {
                email: true,
                sms: false,
                push: true
              }
            },
            security: {
              accessLogs: [],
              documentAccess: [],
              lastReview: null
            }
          };
        }
        if (!exploration.tags) {
          exploration.tags = [];
        }
      },
      beforeUpdate: async (exploration) => {
        exploration.lastModifiedAt = new Date();
        if (
          exploration.changed('status') ||
          exploration.changed('type') ||
          exploration.changed('explorationData') ||
          exploration.changed('metadata')
        ) {
          exploration.version += 1;
        }
      },
    },
  },
);

CareerExploration.associate = function(models) {
  CareerExploration.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'CASCADE',
  });
  
  CareerExploration.belongsTo(models.User, {
    foreignKey: 'consultantId',
    as: 'consultant',
    onDelete: 'SET NULL',
  });
  
  CareerExploration.belongsTo(models.CareerExploration, {
    foreignKey: 'templateId',
    as: 'template',
    onDelete: 'SET NULL',
  });
  
  CareerExploration.hasMany(models.Document, {
    foreignKey: 'explorationId',
    as: 'documents',
    onDelete: 'CASCADE',
  });
  
  CareerExploration.hasMany(models.Conversation, {
    foreignKey: 'explorationId',
    as: 'conversations',
    onDelete: 'CASCADE',
  });
  
  CareerExploration.hasMany(models.AiAnalysis, {
    foreignKey: 'explorationId',
    as: 'aiAnalyses',
    onDelete: 'CASCADE',
  });
};

module.exports = CareerExploration;
