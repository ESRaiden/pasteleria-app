// Este middleware se usa DESPUÉS del de autenticación.
// Su trabajo es verificar si el usuario tiene el rol necesario.

function authorize(roles = []) {
  // Si 'roles' es un string, lo convertimos en un array para que sea más flexible
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Verificamos si el rol del usuario (que viene del token) está en la lista de roles permitidos.
    if (!req.user || !roles.includes(req.user.role)) {
      // Si no hay usuario o su rol no está permitido, denegamos el acceso.
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    
    // Si tiene el permiso, la petición continúa hacia el controlador.
    next();
  };
}

module.exports = authorize;