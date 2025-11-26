import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Admin credentials (in production, store hashed in database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // In production: use bcrypt hashed password
};

const JWT_SECRET = process.env.JWT_SECRET || 'nocturne-admin-secret-key-change-in-production';

// Admin login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { username, role: 'admin' },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

// Middleware to verify admin token
export function verifyAdminToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export default router;

