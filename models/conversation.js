module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Conversation.associate = function(models) {
    // Many-to-many relationship with User (participants)
    Conversation.belongsToMany(models.User, {
      through: 'ConversationParticipants',
      as: 'participants',
      foreignKey: 'conversationId'
    });
    
    // One-to-many relationship with Message
    Conversation.hasMany(models.Message, {
      as: 'messages',
      foreignKey: 'conversationId'
    });
  };

  return Conversation;
}; 