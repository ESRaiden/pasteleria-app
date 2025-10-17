const { Sequelize } = require('sequelize');

// La configuración de la base de datos ahora se lee de las variables de entorno
// definidas en el archivo .env para mayor seguridad y flexibilidad.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Se mantiene desactivado para no llenar la consola con logs de SQL.
  }
);

const conectarDB = async () => {
  try {
    // Verifica que la conexión con la base de datos se ha establecido correctamente.
    await sequelize.authenticate();
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, conectarDB };