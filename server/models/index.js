const { sequelize } = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Folio = require('./Folio');
const FolioEditHistory = require('./FolioEditHistory'); // 1. Importamos el nuevo modelo

// --- Relaciones Principales ---
// Un Usuario (responsable) puede tener muchos Folios
User.hasMany(Folio, { foreignKey: 'responsibleUserId' });
Folio.belongsTo(User, { as: 'responsibleUser', foreignKey: 'responsibleUserId' });

// Un Cliente puede tener muchos Folios
Client.hasMany(Folio, { foreignKey: 'clientId' });
Folio.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// --- Relaciones para el Historial de Edición ---
// Un Folio tiene muchos registros de historial
Folio.hasMany(FolioEditHistory, { as: 'editHistory', foreignKey: 'folioId' });
FolioEditHistory.belongsTo(Folio, { foreignKey: 'folioId' });

// Un Usuario (editor) puede aparecer en muchos registros de historial
User.hasMany(FolioEditHistory, { foreignKey: 'editorUserId' });
FolioEditHistory.belongsTo(User, { as: 'editor', foreignKey: 'editorUserId' });

// --- Exportación de todos los modelos ---
module.exports = {
  sequelize,
  User,
  Client,
  Folio,
  FolioEditHistory
};