const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Folio = sequelize.define('Folio', {
  folioNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  folioType: {
    type: DataTypes.ENUM('Normal', 'Base/Especial'),
    allowNull: false
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  deliveryTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  persons: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shape: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cakeFlavor: {
    type: DataTypes.TEXT,
    allowNull: true 
  },
  filling: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  designDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dedication: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  advancePayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Nuevo', 'En Producción', 'Listo para Entrega', 'Entregado', 'Cancelado'),
    defaultValue: 'Nuevo'
  },
  imageUrls: {
    type: DataTypes.JSON, // Guardará las rutas de las imágenes
    allowNull: true
  },
  // --- NUEVO CAMPO ---
  imageComments: {
    type: DataTypes.JSON, // Guardará los comentarios de las imágenes
    allowNull: true
  },
  tiers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  accessories: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  additional: {
    type: DataTypes.JSON,
    allowNull: true
  },
  complementPersons: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  complementFlavor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complementFilling: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complementDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // --- NUEVO CAMPO ---
  hasExtraHeight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  }
}, { tableName: 'folios' });

module.exports = Folio;