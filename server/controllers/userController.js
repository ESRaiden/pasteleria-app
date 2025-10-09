const { User } = require('../models');

// OBTENER todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Excluimos la contraseña de la respuesta
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

// CREAR un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    // Excluimos la contraseña de la respuesta por seguridad
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// ACTUALIZAR un usuario existente (ej. cambiar rol)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body; // Por ahora, solo permitimos cambiar el rol

    if (req.user.id == userId && role !== 'Administrador') {
        return res.status(403).json({ message: 'No puedes quitarte tu propio rol de administrador.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({ message: 'Usuario actualizado correctamente.', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario.', error: error.message });
  }
};

// ELIMINAR un usuario
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id == userId) {
      return res.status(403).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario.', error: error.message });
  }
};