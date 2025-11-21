// src/routes/citas.routes.js
import { Router } from 'express';
import * as citasCtrl from '../controllers/citas.controller.js';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validate.js';

const router = Router();

/**
 * POST /api/citas
 * Crear cita (beneficiario agenda solicitud)
 * Body:
 *  - id_beneficiario (int)
 *  - id_profesional (int)
 *  - fecha_solicitada (ISO 8601)
 *  - motivo (opcional)
 */
router.post(
  '/',
  body('id_beneficiario').isInt({ gt: 0 }),
  body('id_profesional').isInt({ gt: 0 }),
  body('fecha_solicitada').isISO8601().withMessage('usa formato ISO 8601'),
  body('motivo').optional().isString(),
  validate,
  citasCtrl.crearCita
);

/**
 * GET /api/citas
 * Listar citas con filtros:
 *  - desde=YYYY-MM-DD
 *  - hasta=YYYY-MM-DD
 *  - estado=pendiente|confirmada|rechazada|cancelada|atendida
 *  - profesional=id_profesional
 *  - beneficiario=id_beneficiario
 */
router.get(
  '/',
  query('desde').optional().isISO8601(),
  query('hasta').optional().isISO8601(),
  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'rechazada', 'cancelada', 'atendida']),
  query('profesional').optional().isInt({ gt: 0 }),
  query('beneficiario').optional().isInt({ gt: 0 }),
  validate,
  citasCtrl.listarCitas
);

/**
 * GET /api/citas/:id
 * Obtener detalle de una cita
 */
router.get(
  '/:id',
  param('id').isInt({ gt: 0 }),
  validate,
  citasCtrl.obtenerCita
);

/**
 * PUT /api/citas/:id
 * Actualizar cita:
 *  - fecha_solicitada (reprogramar solicitud)
 *  - fecha_confirmada (ajustar horario final)
 *  - motivo
 *  - notas
 */
router.put(
  '/:id',
  param('id').isInt({ gt: 0 }),
  body('fecha_solicitada').optional().isISO8601(),
  body('fecha_confirmada').optional().isISO8601(),
  body('motivo').optional().isString(),
  body('notas').optional().isString(),
  validate,
  citasCtrl.actualizarCita
);

/**
 * POST /api/citas/:id/confirmar
 * Confirmar cita
 * Body:
 *  - fecha_confirmada (ISO 8601, obligatorio)
 */
router.post(
  '/:id/confirmar',
  param('id').isInt({ gt: 0 }),
  body('fecha_confirmada')
    .isISO8601()
    .withMessage('fecha_confirmada es obligatoria y debe ser ISO 8601'),
  validate,
  citasCtrl.confirmarCita
);

/**
 * POST /api/citas/:id/cancelar
 * Cancelar cita
 * Body:
 *  - motivo_cancelacion (opcional)
 */
router.post(
  '/:id/cancelar',
  param('id').isInt({ gt: 0 }),
  body('motivo_cancelacion').optional().isString(),
  validate,
  citasCtrl.cancelarCita
);

/**
 * POST /api/citas/:id/atender
 * Marcar cita como atendida y registrar notas
 * Body:
 *  - notas (texto de la consulta)
 */
router.post(
  '/:id/atender',
  param('id').isInt({ gt: 0 }),
  body('notas').optional().isString(),
  validate,
  citasCtrl.atenderCita
);

export default router;
