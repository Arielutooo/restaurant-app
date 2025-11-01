import jwt from 'jsonwebtoken';

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

export const verifyStaffPin = async (pin, Staff) => {
  const bcrypt = await import('bcryptjs');
  const staff = await Staff.findOne({ active: true });
  
  if (!staff) return null;
  
  const isValid = await bcrypt.compare(pin, staff.pinHash);
  return isValid ? staff : null;
};

