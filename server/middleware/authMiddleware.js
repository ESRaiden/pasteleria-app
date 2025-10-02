const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Buscamos el token en el encabezado de la petición
  const authHeader = req.header('Authorization');

  // 2. Si no hay token, denegamos el acceso
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    // El token viene en el formato "Bearer <token>", lo separamos
    const token = authHeader.split(' ')[1];

    // 3. Verificamos que el token sea válido con nuestra clave secreta
    const decoded = jwt.verify(token, 'tu_secreto_super_secreto');

    // 4. Si es válido, guardamos los datos del usuario en el objeto de la petición
    req.user = decoded;
    
    // 5. Dejamos que la petición continúe hacia el controlador
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido.' });
  }
};