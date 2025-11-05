import Staff from '../models/Staff.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar staff por email
    const staff = await Staff.findOne({ email: email.toLowerCase(), active: true });

    if (!staff || !staff.passwordHash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, staff.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        staffId: staff._id,
        role: staff.role,
        type: 'staff'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const staff = await Staff.findById(req.staffId).select('-passwordHash -pinHash');
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff no encontrado' });
    }

    res.json({
      success: true,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

