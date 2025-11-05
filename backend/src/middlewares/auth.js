import jwt from 'jsonwebtoken';
import Staff from '../models/Staff.js';

export const verifyTableToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tableData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado: token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'staff') {
      const staff = await Staff.findById(decoded.staffId);
      
      if (!staff || !staff.active) {
        return res.status(401).json({ error: 'Staff no encontrado o inactivo' });
      }
      
      req.staff = staff;
      req.staffId = staff._id;
      req.role = staff.role;
      next();
    } else {
      return res.status(401).json({ error: 'Token no válido para esta operación' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        required: allowedRoles,
        current: req.role
      });
    }

    next();
  };
};

export const verifyStaffPin = async (pin, StaffModel) => {
  const bcrypt = await import('bcryptjs');
  const staff = await StaffModel.findOne({ active: true });
  
  if (!staff) return null;
  
  const isValid = await bcrypt.compare(pin, staff.pinHash);
  return isValid ? staff : null;
};

