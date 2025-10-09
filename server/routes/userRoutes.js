const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Aplicamos autenticación y autorización de Administrador a todas las rutas de este archivo
router.use(authMiddleware, authorize('Administrador'));

// Rutas para la colección de usuarios (/api/users)
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

// Rutas para un usuario específico (/api/users/:id)
router.route('/:id')
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;