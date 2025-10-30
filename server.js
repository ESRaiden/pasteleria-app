// --- CONFIGURACIÓN DE ENTORNO ---
// Carga las variables de entorno desde el archivo .env al inicio de la aplicación
require('dotenv').config();

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

// ======================= INICIO DE LA MODIFICACIÓN =======================
// Servir archivos estáticos del frontend (HTML, CSS, JS) desde la carpeta 'public'
// Esta línea es clave para que Render pueda encontrar main.js, style.css, etc.
app.use(express.static(path.join(__dirname, 'public')));
// ======================== FIN DE LA MODIFICACIÓN =========================

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

// ======================= INICIO DE LA MODIFICACIÓN =======================
// Esta ruta "catch-all" debe ir DESPUÉS de todas las rutas API y estáticas.
// Envía el 'index.html' para cualquier ruta que no sea de la API.
// Esto soluciona problemas al refrescar la página en producción.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ======================== FIN DE LA MODIFICACIÓN =========================


// --- INICIO DEL SERVIDOR ---
sequelize.sync({ force: false }).then(() => {
  console.log('🔄 Modelos sincronizados con la base de datos.');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ Error al sincronizar con la base de datos:', error);
});
