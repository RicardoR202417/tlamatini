import { Router } from 'express';
import {
  listarUsuarios,
  getProfile,
  updateProfile
} from '../controllers/usuarios.controller.js';
import {
  register,
  login
} from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateProfile);
router.get('/', authRequired, listarUsuarios);

export default router;
