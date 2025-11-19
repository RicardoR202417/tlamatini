import express from 'express';
import {
  obtenerActividades,
  obtenerActividadPorId,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  inscribirseEnActividad,
  cancelarInscripcion,
  obtenerInscripcionesUsuario
} from '../controllers/actividades.controller.js';
import { authRequired } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerActividades);

// Rutas protegidas (requieren autenticación) - MÁS ESPECÍFICAS PRIMERO
router.post('/:idActividad/inscripciones', authRequired, inscribirseEnActividad);
router.delete('/inscripciones/:idInscripcion', authRequired, cancelarInscripcion);
router.get('/usuario/:idUsuario/inscripciones', authRequired, obtenerInscripcionesUsuario);

// Rutas de admin (crear, actualizar, eliminar)
router.post('/', authRequired, crearActividad);
router.put('/:id', authRequired, actualizarActividad);
router.delete('/:id', authRequired, eliminarActividad);

// Obtener actividad por ID - MENOS ESPECÍFICA AL FINAL
router.get('/:id', obtenerActividadPorId);

export default router;
