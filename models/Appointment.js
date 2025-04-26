const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Appointment extends Model {}

Appointment.init(
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
      onDelete: 'CASCADE',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in minutes',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled', 'no_show'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    type: {
      type: DataTypes.ENUM('consultation', 'follow_up', 'assessment', 'review', 'training', 'other'),
      allowNull: false,
      defaultValue: 'consultation',
    },
    locationType: {
      type: DataTypes.ENUM('physical', 'virtual', 'hybrid'),
      allowNull: false,
      defaultValue: 'physical',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTC',
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurrence: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('recurrence');
        return rawValue ? JSON.parse(rawValue) : {
          frequency: null,
          interval: 1,
          daysOfWeek: [],
          daysOfMonth: [],
          monthsOfYear: [],
          endDate: null,
          occurrences: null,
          exceptions: []
        };
      },
      set(value) {
        this.setDataValue('recurrence', JSON.stringify(value));
      },
    },
    reminderSettings: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('reminderSettings');
        return rawValue ? JSON.parse(rawValue) : {
          email: true,
          sms: false,
          push: true,
          reminders: [
            { type: 'email', minutes: 1440 },
            { type: 'push', minutes: 60 }
          ],
          customMessages: {
            email: '',
            sms: '',
            push: ''
          }
        };
      },
      set(value) {
        this.setDataValue('reminderSettings', JSON.stringify(value));
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          customFields: {},
          history: {
            statusChanges: [],
            reschedules: [],
            cancellations: [],
            notes: []
          },
          participants: {
            required: [],
            optional: [],
            confirmed: [],
            declined: []
          },
          resources: {
            required: [],
            optional: [],
            booked: []
          },
          statistics: {
            totalDuration: 0,
            totalReschedules: 0,
            totalCancellations: 0,
            averageRating: 0,
            feedbackCount: 0
          },
          feedback: {
            rating: null,
            comments: '',
            suggestions: '',
            followUpRequired: false
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
    modelName: 'Appointment',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['consultantId'],
      },
      {
        fields: ['startTime'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isRecurring'],
      },
      {
        fields: ['beneficiaryId', 'consultantId', 'startTime'],
        unique: true,
      },
      {
        fields: ['status', 'startTime'],
      },
      {
        fields: ['type', 'startTime'],
      },
      {
        fields: ['isRecurring', 'startTime'],
      },
    ],
    hooks: {
      beforeCreate: async (appointment) => {
        appointment.lastModifiedAt = new Date();
        if (!appointment.metadata) {
          appointment.metadata = {
            description: '',
            customFields: {},
            history: {
              statusChanges: [],
              reschedules: [],
              cancellations: [],
              notes: []
            },
            participants: {
              required: [],
              optional: [],
              confirmed: [],
              declined: []
            },
            resources: {
              required: [],
              optional: [],
              booked: []
            },
            statistics: {
              totalDuration: 0,
              totalReschedules: 0,
              totalCancellations: 0,
              averageRating: 0,
              feedbackCount: 0
            },
            feedback: {
              rating: null,
              comments: '',
              suggestions: '',
              followUpRequired: false
            }
          };
        }
        if (!appointment.recurrence) {
          appointment.recurrence = {
            frequency: null,
            interval: 1,
            daysOfWeek: [],
            daysOfMonth: [],
            monthsOfYear: [],
            endDate: null,
            occurrences: null,
            exceptions: []
          };
        }
        if (!appointment.reminderSettings) {
          appointment.reminderSettings = {
            email: true,
            sms: false,
            push: true,
            reminders: [
              { type: 'email', minutes: 1440 },
              { type: 'push', minutes: 60 }
            ],
            customMessages: {
              email: '',
              sms: '',
              push: ''
            }
          };
        }
      },
      beforeUpdate: async (appointment) => {
        appointment.lastModifiedAt = new Date();
        if (appointment.changed('status')) {
          const metadata = appointment.metadata;
          metadata.history.statusChanges.push({
            date: new Date(),
            oldStatus: appointment.previous('status'),
            newStatus: appointment.status,
            changedBy: appointment.consultantId
          });
          appointment.metadata = metadata;
        }
      },
    },
  },
);

Appointment.associate = function(models) {
  Appointment.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'CASCADE',
  });
  
  Appointment.belongsTo(models.User, {
    foreignKey: 'consultantId',
    as: 'consultant',
    onDelete: 'CASCADE',
  });
};

module.exports = Appointment;
