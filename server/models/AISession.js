const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AISession = sequelize.define('AISession', {
  whatsappConversation: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'El texto completo de la conversación con el cliente.'
  },
  extractedData: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Objeto JSON con los datos del folio, que se irá actualizando.'
  },
  imageUrls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array con las rutas de las imágenes descargadas.'
  },
  chatHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Historial de la conversación entre el empleado y la IA.'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  }
}, { tableName: 'ai_sessions' });

module.exports = AISession;