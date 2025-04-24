const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Appointment extends Model {}

Appointment.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // durée en minutes
      allowNull: false,
      defaultValue: 60,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
  },
);

module.exports = Appointment;
