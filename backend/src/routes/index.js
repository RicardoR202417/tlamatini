import { Router } from 'express';
import healthRoutes from './health.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();
router.use('/health', healthRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/auth', authRoutes);
export default router;
