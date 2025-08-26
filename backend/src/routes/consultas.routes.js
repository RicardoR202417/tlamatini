// src/routes/consultas.routes.js
import { Router } from 'express';
import * as consultasCtrl from '../controllers/consultas.controller.js';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validate.js';
// import auth, { isProfesional } from '../middlewares/auth.js';


const router = Router();


// registrar consulta (a partir de una cita confirmada)
router.post(
'/',
body('id_cita').isInt({ gt: 0 }),
body('id_profesional').isInt({ gt: 0 }),
body('id_beneficiario').isInt({ gt: 0 }),
body('duracion_min').optional().isInt({ gt: 0 }),
body('diagnostico').optional().isString(),
body('receta').optional().isString(),
body('observaciones').optional().isString(),
body('estado').optional().isIn(['realizada','no_asistio','reprogramada']),
validate,
// auth, isProfesional,
consultasCtrl.crearConsulta
);


// listar consultas con filtros (?desde=...&hasta=...&profesional=...&beneficiario=...&estado=...)
router.get(
'/',
query('desde').optional().isISO8601(),
query('hasta').optional().isISO8601(),
query('profesional').optional().isInt({ gt: 0 }),
query('beneficiario').optional().isInt({ gt: 0 }),
query('estado').optional().isIn(['realizada','no_asistio','reprogramada']),
validate,
// auth,
consultasCtrl.listarConsultas
);


router.get('/:id', param('id').isInt({ gt: 0 }), validate, consultasCtrl.obtenerConsulta);


export default router;