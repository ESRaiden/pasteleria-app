const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Commission = sequelize.define('Commission', {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Almacena el valor exacto del 5% del total del folio, sin redondear.'
  },
  appliedToCustomer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la comisión redondeada fue agregada al costo del cliente.'
  },
  roundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Almacena el valor redondeado que se le cobró al cliente, si aplica.'
  }
}, {
  tableName: 'commissions',
  timestamps: true, // Guardará la fecha de creación automáticamente
  updatedAt: false // No necesitamos la fecha de actualización
});

module.exports = Commission;