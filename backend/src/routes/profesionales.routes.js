import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from '../controllers/profesionales.controller.js';
import validate from '../middlewares/validate.js';
// import auth, { isProfesional, isAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/',
  body('id_profesional').isInt({ gt: 0 }),
  body('especialidad').isString().notEmpty(),
  body('cedula_profesional').isString().notEmpty(),
  body('documento_url').optional().isString(),
  validate,
  /* auth, isProfesional, */
  ctrl.crear
);

router.get('/',
  query('q').optional().isString(),
  query('especialidad').optional().isString(),
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0, lt: 101 }),
  validate,
  ctrl.listar
);

router.get('/:id', param('id').isInt({ gt: 0 }), validate, ctrl.obtener);

router.put('/:id',
  param('id').isInt({ gt: 0 }),
  body('especialidad').optional().isString(),
  body('cedula_profesional').optional().isString(),
  body('documento_url').optional().isString(),
  validate,
  /* auth, isProfesional, */
  ctrl.actualizar
);

router.delete('/:id',
  param('id').isInt({ gt: 0 }), validate,
  /* auth, isAdmin, */
  ctrl.eliminar
);

export default router;
