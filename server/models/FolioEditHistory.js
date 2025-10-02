const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FolioEditHistory = sequelize.define('FolioEditHistory', {
  // El 'id' del registro, 'folioId', 'editorUserId' y 'createdAt'
  // serán creados y gestionados automáticamente por Sequelize
  // a través de las relaciones y los timestamps.
}, {
  tableName: 'folio_edit_histories',
  updatedAt: false // No necesitamos la columna 'updatedAt' en esta tabla.
});

module.exports = FolioEditHistory;