const { sequelize } = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Folio = require('./Folio');
const FolioEditHistory = require('./FolioEditHistory');
const Commission = require('./Commission'); 

// --- Relaciones Principales ---
User.hasMany(Folio, { foreignKey: 'responsibleUserId' });
Folio.belongsTo(User, { as: 'responsibleUser', foreignKey: 'responsibleUserId' });

Client.hasMany(Folio, { foreignKey: 'clientId' });
Folio.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// --- Relación para Comisiones (CORREGIDO) ---
// Un Folio tiene una Comisión asociada
Folio.hasOne(Commission, { foreignKey: 'folioId', as: 'commission' });
// ==================== INICIO DE LA CORRECCIÓN ====================
// Aquí se añade el alias 'as: folio' que faltaba
Commission.belongsTo(Folio, { foreignKey: 'folioId', as: 'folio' });
// ===================== FIN DE LA CORRECCIÓN ======================

// --- Relaciones para el Historial de Edición ---
Folio.hasMany(FolioEditHistory, { as: 'editHistory', foreignKey: 'folioId' });
FolioEditHistory.belongsTo(Folio, { foreignKey: 'folioId' });

User.hasMany(FolioEditHistory, { foreignKey: 'editorUserId' });
FolioEditHistory.belongsTo(User, { as: 'editor', foreignKey: 'editorUserId' });

// --- Exportación de todos los modelos ---
module.exports = {
  sequelize,
  User,
  Client,
  Folio,
  FolioEditHistory,
  Commission 
};