const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pasteleria_db', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false 
});

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, conectarDB };