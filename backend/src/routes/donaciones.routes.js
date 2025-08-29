import express from 'express';
import { 
    registrarDonacion, 
    obtenerDonacionPorId, 
    obtenerDonacionesPorUsuario,
    validarDonacion,
    obtenerEstadisticasDonaciones,
    actualizarValidado
} from '../controllers/donaciones.controller.js';
import { 
    subirEvidencia, 
    manejarErroresSubida, 
    procesarArchivosSubidos 
} from '../middlewares/upload.js';

const router = express.Router();

// Endpoint para registrar una donación (con subida de evidencias)
router.post('/donaciones', 
    subirEvidencia, 
    manejarErroresSubida, 
    procesarArchivosSubidos, 
    registrarDonacion
);

// Endpoint para obtener una donación por ID
router.get('/donaciones/:id', obtenerDonacionPorId);

// Endpoint para obtener donaciones de un usuario
router.get('/usuarios/:id_usuario/donaciones', obtenerDonacionesPorUsuario);

// Endpoint para obtener estadísticas de donaciones de un usuario
router.get('/usuarios/:id_usuario/donaciones/estadisticas', obtenerEstadisticasDonaciones);

// Endpoint para validar/rechazar una donación (administradores)
router.patch('/donaciones/:id/validar', validarDonacion);

// Endpoint para actualizar estado de validación
router.put('/donaciones/:id/estado', actualizarValidado);

// Endpoint para obtener todas las donaciones (admin)
router.get('/donaciones', obtenerDonacionesPorUsuario);

export default router;
