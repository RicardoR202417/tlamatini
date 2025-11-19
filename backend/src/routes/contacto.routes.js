import { Router } from 'express';
import { crearMensajeContacto } from '../controllers/contact.controller.js';

const router = Router();

// POST /api/contacto
router.post('/', crearMensajeContacto);

export default router;
