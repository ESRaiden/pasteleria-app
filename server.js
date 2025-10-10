const express = require('express');
const cors = require('cors');
const path = require('path'); // Necesario para servir archivos estáticos
const { sequelize } = require('./server/models');
const { conectarDB } = require('./server/config/database');

const authRoutes = require('./server/routes/authRoutes');
const folioRoutes = require('./server/routes/folioRoutes');
const userRoutes = require('./server/routes/userRoutes');
const clientRoutes = require('./server/routes/clientRoutes');

const app = express();
const PORT = 3000;

conectarDB();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Se añadió PATCH
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Hacemos que la carpeta 'uploads' sea accesible públicamente
// Esto es necesario para que el PDF pueda encontrar las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: '¡API de la Pastelería La Fiesta funcionando!' });
});

app.use('/api/auth', authRoutes); 
app.use('/api/folios', folioRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);

sequelize.sync({ force: false }).then(() => {
  console.log('🔄 Modelos sincronizados con la base de datos.');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ Error al sincronizar con la base de datos:', error);
});