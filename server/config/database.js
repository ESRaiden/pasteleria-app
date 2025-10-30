const { Sequelize } = require('sequelize');

// La configuración de la base de datos ahora se lee de las variables de entorno
// definidas en el archivo .env para mayor seguridad y flexibilidad.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql', // Usa postgres en Render, mysql localmente
    logging: false, // Se mantiene desactivado para no llenar la consola con logs de SQL.
    
    // ==================== INICIO DE LA CORRECCIÓN ====================
    dialectOptions: {
      charset: 'utf8mb4',
      // Añadir opciones SSL solo si el dialecto es postgres (para Render)
      ...(process.env.DB_DIALECT === 'postgres' && {
        ssl: {
          require: true,
          rejectUnauthorized: false // Requerido para conexiones internas de Render
        }
      })
    }
    // ===================== FIN DE LA CORRECCIÓN ======================
  }
);

const conectarDB = async () => {
  try {
    // Verifica que la conexión con la base de datos se ha establecido correctamente.
    await sequelize.authenticate();
    // Mensaje de éxito solo si la autenticación funciona
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, conectarDB };