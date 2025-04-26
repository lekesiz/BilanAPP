const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Beneficiary extends Model {}

Beneficiary.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('initial', 'active', 'completed', 'on_hold', 'archived', 'deleted', 'pending', 'rejected', 'suspended'),
      defaultValue: 'initial',
      allowNull: false,
    },
    currentPhase: {
      type: DataTypes.ENUM('preliminary', 'investigation', 'conclusion', 'follow_up', 'completed', 'review', 'assessment', 'planning', 'implementation', 'evaluation'),
      defaultValue: 'preliminary',
      allowNull: false,
    },
    profile: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('profile');
        return rawValue ? JSON.parse(rawValue) : {
          personal: {
            title: '',
            gender: null,
            birthDate: null,
            nationality: null,
            maritalStatus: null,
            dependents: 0,
            disabilities: [],
            languages: []
          },
          contact: {
            email: null,
            phone: null,
            address: {
              street: '',
              city: '',
              state: '',
              country: '',
              postalCode: ''
            },
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            }
          },
          professional: {
            currentOccupation: '',
            currentEmployer: '',
            employmentStatus: '',
            yearsOfExperience: 0,
            desiredSalary: null,
            availability: {
              startDate: null,
              noticePeriod: null,
              fullTime: true,
              partTime: false,
              remote: false,
              hybrid: false,
              onsite: true
            }
          },
          education: {
            highestDegree: '',
            fieldOfStudy: '',
            institution: '',
            graduationYear: null,
            gpa: null,
            additionalCertifications: []
          },
          skills: {
            technical: [],
            soft: [],
            languages: [],
            certifications: [],
            tools: []
          },
          preferences: {
            workEnvironment: [],
            companySize: [],
            industries: [],
            locations: [],
            workSchedule: [],
            benefits: []
          },
          documents: {
            resume: null,
            coverLetter: null,
            certificates: [],
            references: [],
            portfolio: null
          }
        };
      },
      set(value) {
        this.setDataValue('profile', JSON.stringify(value));
      },
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('education');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('education', JSON.stringify(value));
      },
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('experience');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('experience', JSON.stringify(value));
      },
    },
    identifiedSkills: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('identifiedSkills');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('identifiedSkills', JSON.stringify(value));
      },
    },
    careerObjectives: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('careerObjectives');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('careerObjectives', JSON.stringify(value));
      },
    },
    actionPlan: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('actionPlan');
        return rawValue ? JSON.parse(rawValue) : {
          goals: {
            shortTerm: [],
            mediumTerm: [],
            longTerm: []
          },
          steps: [],
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
          },
          progress: {
            completedSteps: [],
            currentStep: null,
            nextSteps: [],
            challenges: [],
            achievements: []
          },
          support: {
            required: [],
            provided: [],
            pending: []
          },
          evaluation: {
            metrics: [],
            checkpoints: [],
            feedback: []
          }
        };
      },
      set(value) {
        this.setDataValue('actionPlan', JSON.stringify(value));
      },
    },
    synthesis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bilanStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    bilanEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consentGiven: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    consentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    agreementDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    checklist: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('checklist');
        return rawValue ? JSON.parse(rawValue) : {
          preliminary: {
            interview_info_completed: false,
            request_analysis_completed: false,
            agreement_signed: false
          },
          investigation: {
            career_path_analyzed: false,
            skills_assessed: false,
            interests_explored: false,
            project_explored: false
          },
          conclusion: {
            synthesis_written: false,
            action_plan_defined: false,
            synthesis_interview_completed: false
          },
          follow_up: {
            six_month_interview_completed: false
          }
        };
      },
      set(value) {
        this.setDataValue('checklist', JSON.stringify(value));
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
            phaseChanges: [],
            consultantChanges: [],
            documentChanges: [],
            activityHistory: []
          },
          statistics: {
            totalMeetings: 0,
            totalDocuments: 0,
            totalQuestionnaires: 0,
            totalConversations: 0,
            averageMeetingDuration: 0
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
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phaseHistory: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('phaseHistory');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('phaseHistory', JSON.stringify(value));
      },
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
  },
  {
    sequelize,
    modelName: 'Beneficiary',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['consultantId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['currentPhase'],
      },
      {
        fields: ['bilanStartDate'],
      },
      {
        fields: ['bilanEndDate'],
      },
      {
        fields: ['followUpDate'],
      },
      {
        fields: ['lastActivityAt'],
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
        fields: ['status', 'currentPhase'],
      },
      {
        fields: ['consultantId', 'status'],
      },
      {
        fields: ['consultantId', 'currentPhase'],
      },
      {
        fields: ['bilanStartDate', 'status'],
      },
      {
        fields: ['bilanEndDate', 'status'],
      },
      {
        fields: ['followUpDate', 'status'],
      },
      {
        fields: ['priority', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (beneficiary) => {
        beneficiary.lastModifiedAt = new Date();
        if (!beneficiary.profile) {
          beneficiary.profile = {
            personal: {
              title: '',
              gender: null,
              birthDate: null,
              nationality: null,
              maritalStatus: null,
              dependents: 0,
              disabilities: [],
              languages: []
            },
            contact: {
              email: null,
              phone: null,
              address: {
                street: '',
                city: '',
                state: '',
                country: '',
                postalCode: ''
              },
              emergencyContact: {
                name: '',
                relationship: '',
                phone: ''
              }
            },
            professional: {
              currentOccupation: '',
              currentEmployer: '',
              employmentStatus: '',
              yearsOfExperience: 0,
              desiredSalary: null,
              availability: {
                startDate: null,
                noticePeriod: null,
                fullTime: true,
                partTime: false,
                remote: false,
                hybrid: false,
                onsite: true
              }
            },
            education: {
              highestDegree: '',
              fieldOfStudy: '',
              institution: '',
              graduationYear: null,
              gpa: null,
              additionalCertifications: []
            },
            skills: {
              technical: [],
              soft: [],
              languages: [],
              certifications: [],
              tools: []
            },
            preferences: {
              workEnvironment: [],
              companySize: [],
              industries: [],
              locations: [],
              workSchedule: [],
              benefits: []
            },
            documents: {
              resume: null,
              coverLetter: null,
              certificates: [],
              references: [],
              portfolio: null
            }
          };
        }
        if (!beneficiary.education) {
          beneficiary.education = [];
        }
        if (!beneficiary.experience) {
          beneficiary.experience = [];
        }
        if (!beneficiary.identifiedSkills) {
          beneficiary.identifiedSkills = [];
        }
        if (!beneficiary.careerObjectives) {
          beneficiary.careerObjectives = [];
        }
        if (!beneficiary.actionPlan) {
          beneficiary.actionPlan = {
            goals: {
              shortTerm: [],
              mediumTerm: [],
              longTerm: []
            },
            steps: [],
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
            },
            progress: {
              completedSteps: [],
              currentStep: null,
              nextSteps: [],
              challenges: [],
              achievements: []
            },
            support: {
              required: [],
              provided: [],
              pending: []
            },
            evaluation: {
              metrics: [],
              checkpoints: [],
              feedback: []
            }
          };
        }
        if (!beneficiary.checklist) {
          beneficiary.checklist = {
            preliminary: {
              interview_info_completed: false,
              request_analysis_completed: false,
              agreement_signed: false
            },
            investigation: {
              career_path_analyzed: false,
              skills_assessed: false,
              interests_explored: false,
              project_explored: false
            },
            conclusion: {
              synthesis_written: false,
              action_plan_defined: false,
              synthesis_interview_completed: false
            },
            follow_up: {
              six_month_interview_completed: false
            }
          };
        }
        if (!beneficiary.metadata) {
          beneficiary.metadata = {
            description: '',
            notes: '',
            customFields: {},
            history: {
              statusChanges: [],
              phaseChanges: [],
              consultantChanges: [],
              documentChanges: [],
              activityHistory: []
            },
            statistics: {
              totalMeetings: 0,
              totalDocuments: 0,
              totalQuestionnaires: 0,
              totalConversations: 0,
              averageMeetingDuration: 0
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
        if (!beneficiary.phaseHistory) {
          beneficiary.phaseHistory = [];
        }
        if (!beneficiary.tags) {
          beneficiary.tags = [];
        }
      },
      beforeUpdate: async (beneficiary) => {
        beneficiary.lastModifiedAt = new Date();
        if (
          beneficiary.changed('status') ||
          beneficiary.changed('currentPhase') ||
          beneficiary.changed('profile') ||
          beneficiary.changed('actionPlan') ||
          beneficiary.changed('checklist')
        ) {
          beneficiary.version += 1;
        }
      },
    },
  },
);

Beneficiary.associate = function(models) {
  Beneficiary.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  
  Beneficiary.belongsTo(models.User, {
    foreignKey: 'consultantId',
    as: 'consultant',
    onDelete: 'SET NULL',
  });
  
  Beneficiary.hasMany(models.Questionnaire, {
    foreignKey: 'beneficiaryId',
    as: 'questionnaires',
    onDelete: 'CASCADE',
  });
  
  Beneficiary.hasMany(models.Conversation, {
    foreignKey: 'beneficiaryId',
    as: 'conversations',
    onDelete: 'CASCADE',
  });

  Beneficiary.hasMany(models.Document, {
    foreignKey: 'beneficiaryId',
    as: 'documents',
    onDelete: 'CASCADE',
  });

  Beneficiary.hasMany(models.Appointment, {
    foreignKey: 'beneficiaryId',
    as: 'appointments',
    onDelete: 'CASCADE',
  });

  Beneficiary.hasMany(models.AiAnalysis, {
    foreignKey: 'beneficiaryId',
    as: 'aiAnalyses',
    onDelete: 'CASCADE',
  });

  Beneficiary.hasMany(models.CareerExploration, {
    foreignKey: 'beneficiaryId',
    as: 'careerExplorations',
    onDelete: 'CASCADE',
  });
};

module.exports = Beneficiary;
