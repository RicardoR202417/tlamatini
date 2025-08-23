import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, googleSignIn, me,
  validateLogin, validateRegister,
  refresh, logout
} from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/auth.js';

const router = Router();

// límite simple para frenar ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 60_000, // 1 minuto
  max: 20,          // 20 req/min por IP en rutas /auth
  standardHeaders: true,
  legacyHeaders: false
});

router.use(limiter);

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleSignIn);

router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', authRequired, me);

export default router;
