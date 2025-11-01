// --- CONFIGURACIÓN DE ENTORNO ---
// Carga las variables de entorno SÓLO SI NO ESTAMOS en producción
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// --- IMPORTACIÓN DE MÓDULOS ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./server/models');
const { conectarDB } = require('./server/config/database');

// --- IMPORTACIÓN DE RUTAS ---
const authRoutes = require('./server/routes/authRoutes');
const folioRoutes = require('./server/routes/folioRoutes');
const userRoutes = require('./server/routes/userRoutes');
const clientRoutes = require('./server/routes/clientRoutes');
const whatsappRoutes = require('./server/routes/whatsappRoutes');
const aiSessionRoutes = require('./server/routes/aiSessionRoutes');
const testRoutes = require('./server/routes/testRoutes');
const dictationRoutes = require('./server/routes/dictationRoutes');

// --- TAREAS PROGRAMADAS ---
// Esta línea importa e inicia las tareas programadas (como el envío de correos)
require('./server/cronJobs');

// --- CONFIGURACIÓN DE LA APLICACIÓN ---
const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto del entorno o 3000 por defecto

// Conectar a la base de datos
conectarDB();

// --- MIDDLEWARES ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ======================= MODIFICACIÓN 1 =======================
// Servir archivos estáticos del frontend (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// ================================================================

// Servir archivos estáticos de la carpeta 'uploads' de forma pública
// Esto es necesario para que el PDF y el frontend puedan encontrar las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- RUTAS DE LA API ---
// (Estas son las únicas rutas que debe manejar este servidor)

app.get('/api', (req, res) => {
  res.json({ message: '¡API de la Pastelería La Fiesta funcionando!' });
});

app.use('/api/auth', authRoutes); 
app.use('/api/folios', folioRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/webhooks', whatsappRoutes);
app.use('/api/ai-sessions', aiSessionRoutes);
app.use('/api/test', testRoutes);
app.use('/api/dictation', dictationRoutes);

// ======================= MODIFICACIÓN 2 =======================
// Esta ruta "catch-all" debe ir DESPUÉS de todas las rutas API.
// Envía el 'index.html' para cualquier ruta que no sea de la API.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ================================================================

// --- INICIO DEL SERVIDOR ---
sequelize.sync({ force: false }).then(() => {
  console.log('🔄 Modelos sincronizados con la base de datos.');
  
  // ======================= MODIFICACIÓN 3 =======================
  // Forzamos al servidor a escuchar en '0.0.0.0' y cambiamos el log
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo y escuchando en http://0.0.0.0:${PORT}`);
  });
  // ================================================================

}).catch(error => {
  console.error('❌ Error al sincronizar con la base de datos:', error);
});