// src/routes/citas.routes.js
import { Router } from 'express';
import * as citasCtrl from '../controllers/citas.controller.js';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validate.js';
// import auth, { isProfesional } from '../middlewares/auth.js';


const router = Router();


// crear cita (beneficiario agenda)
router.post(
'/',
body('id_beneficiario').isInt({ gt: 0 }),
body('id_profesional').isInt({ gt: 0 }),
body('fecha_hora').isISO8601().withMessage('usa formato ISO 8601'),
body('notas').optional().isString(),
validate,
// auth,
citasCtrl.crearCita
);


// listar citas con filtros (?desde=yyyy-mm-dd&hasta=yyyy-mm-dd&estado=...&profesional=...&beneficiario=...)
router.get(
'/',
query('desde').optional().isISO8601(),
query('hasta').optional().isISO8601(),
query('estado').optional().isIn(['pendiente','confirmada','cancelada']),
query('profesional').optional().isInt({ gt: 0 }),
query('beneficiario').optional().isInt({ gt: 0 }),
validate,
// auth,
citasCtrl.listarCitas
);


// obtener detalle
router.get('/:id', param('id').isInt({ gt: 0 }), validate, citasCtrl.obtenerCita);


// reprogramar / actualizar notas
router.put(
'/:id',
param('id').isInt({ gt: 0 }),
body('fecha_hora').optional().isISO8601(),
body('notas').optional().isString(),
validate,
// auth,
citasCtrl.actualizarCita
);


// confirmar (solo profesional)
router.post('/:id/confirmar', param('id').isInt({ gt: 0 }), validate, /*auth, isProfesional,*/ citasCtrl.confirmarCita);


// cancelar (profesional o beneficiario)
router.post(
'/:id/cancelar',
param('id').isInt({ gt: 0 }),
body('motivo').optional().isString(),
validate,
// auth,
citasCtrl.cancelarCita
);


export default router;