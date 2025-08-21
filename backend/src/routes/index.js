import { Router } from 'express';
import healthRoutes from './health.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();
router.use('/health', healthRoutes);
router.use('/usuarios', usuariosRoutes);
export default router;
