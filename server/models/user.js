const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  // Sequelize crea el 'id' automáticamente
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // ==================== INICIO DE LA MODIFICACIÓN ====================
  role: {
    type: DataTypes.ENUM('Administrador', 'Usuario'), // Se elimina 'Decorador'
    allowNull: false,
    defaultValue: 'Usuario'
  }
  // ===================== FIN DE LA MODIFICACIÓN ======================
}, {
  tableName: 'users' // Asegura que el nombre de la tabla sea 'users'
});

module.exports = User;