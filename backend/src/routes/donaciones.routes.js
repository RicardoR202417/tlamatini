import express from 'express';
import { registrarDonacion, obtenerDonacionPorId } from '../controllers/donaciones.controller.js';

const router = express.Router();

// Endpoint para registrar una donación
router.post('/donaciones', registrarDonacion);

// Endpoint para obtener una donación por ID
router.get('/donaciones/:id', obtenerDonacionPorId);

export default router;
