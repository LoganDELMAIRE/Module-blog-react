const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      
      if (req.user.role.name === 'super_admin') {
        return next();
      }

      if (!roles.includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };
};

module.exports = checkRole; 