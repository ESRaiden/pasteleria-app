const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Define las rutas para la colección de clientes
router.route('/')
    .get(clientController.getAllClients)   // GET /api/clients
    .post(clientController.createClient);  // POST /api/clients

module.exports = router;