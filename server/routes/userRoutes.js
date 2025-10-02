const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define las rutas para la colección de usuarios
router.route('/')
    .get(userController.getAllUsers)     // GET /api/users
    .post(userController.createUser);    // POST /api/users

module.exports = router;