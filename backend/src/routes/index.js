import { Router } from 'express';
import healthRoutes from './health.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import authRoutes from './auth.routes.js';

// 👇 importa también estas (si ya las tienes)
import profesionalesRoutes from './profesionales.routes.js';
import citasRoutes from './citas.routes.js';
import consultasRoutes from './consultas.routes.js';
import donacionesRoutes from './donaciones.routes.js';
import facturasRoutes from './facturas.routes.js';
import pagosRoutes from './pagos.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/auth', authRoutes);

// 👇 monta profesionales (y lo demás si aplica)
router.use('/profesionales', profesionalesRoutes);
router.use('/citas', citasRoutes);
router.use('/consultas', consultasRoutes);
router.use('/donaciones', donacionesRoutes);
router.use('/facturas', facturasRoutes);
router.use('/pagos', pagosRoutes);

export default router;
