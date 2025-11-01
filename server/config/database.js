// server/config/database.js (MODIFICADO)
const { Sequelize } = require('sequelize');

let sequelize;

// Detecta si está en producción (como Railway o Render)
if (process.env.DATABASE_URL) {
  // Railway y otros servicios proveen la URL de conexión completa
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT || 'postgres', // Asegúrate de poner 'postgres' en las variables
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido para conexiones en la nube
      }
    }
  });
} else {
  // Configuración para tu localhost (usando .env)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false
    }
  );
}

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, conectarDB };