const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  let token;
  const authHeader = req.header('Authorization');

  // 1. Intentamos obtener el token del encabezado 'Authorization' (método estándar)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // 2. Si no hay token en el encabezado, buscamos en los parámetros de la URL (para enlaces como el del PDF)
  else if (req.query.token) {
    token = req.query.token;
  }

  // 3. Si no se encuentra un token en ninguno de los dos lugares, denegamos el acceso.
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    // 4. Verificamos que el token sea válido usando la clave secreta.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Si es válido, guardamos los datos del usuario en el objeto de la petición para uso posterior.
    req.user = decoded;
    
    // 6. Permitimos que la petición continúe hacia el controlador correspondiente.
    next();
  } catch (error) {
    // Si la verificación falla (token inválido o expirado), devolvemos un error.
    res.status(401).json({ message: 'Token no válido.' });
  }
};