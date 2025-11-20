import { Router } from 'express';
import {
  listarUsuarios,
  getProfile,
  updateProfile,
  validateUpdateProfile,
  changePassword,
  validateChangePassword,
  deleteAccount,
  validateDeleteAccount
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
router.put('/profile', authRequired, validateUpdateProfile, updateProfile);
router.put('/contrasena', authRequired, validateChangePassword, changePassword);
router.delete('/delete-account', authRequired, validateDeleteAccount, deleteAccount);
router.get('/', authRequired, listarUsuarios);

export default router;
