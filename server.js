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
require('./server/cronJobs');

// --- CONFIGURACIÓN DE LA APLICACIÓN ---
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
conectarDB();

// --- MIDDLEWARES ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Servir archivos estáticos de la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- RUTAS DE LA API (DEBEN IR PRIMERO) ---
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


// --- SERVIR FRONTEND ESTÁTICO (DEBE IR DESPUÉS DE LA API) ---
// Sirve los archivos de la carpeta raíz (index.html, main.js, etc.)
app.use(express.static(__dirname));

// Manejador "catch-all": Si no es una ruta API, sirve el index.html
// Esto permite que tu frontend maneje las rutas.
app.get('*', (req, res) => {
    // Asegúrate de no interceptar las rutas de la API que fallan
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'Ruta API no encontrada.' });
    }
    // Para cualquier otra cosa, sirve el frontend
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- INICIO DEL SERVIDOR ---
sequelize.sync({ force: false }).then(() => {
  console.log('🔄 Modelos sincronizados con la base de datos.');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ Error al sincronizar con la base de datos:', error);
});