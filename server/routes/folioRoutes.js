const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const folioController = require('../controllers/folioController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único con la fecha y la extensión original
    cb(null, `folio_img_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Aplicamos el middleware de autenticación a todas las rutas de folios
router.use(authMiddleware);

// Rutas para la colección de folios (/api/folios)
router.route('/')
  .get(folioController.getAllFolios)
  // Aplicamos el middleware 'upload' para aceptar hasta 5 archivos de imagen
  .post(upload.array('referenceImages', 5), folioController.createFolio);

// Rutas para un folio específico (/api/folios/:id)
router.route('/:id')
  .get(folioController.getFolioById)
  .put(folioController.updateFolio)
  .delete(authorize('Administrador'), folioController.deleteFolio);

// Ruta especial para generar el PDF
router.get('/:id/pdf', folioController.generateFolioPdf);

module.exports = router;