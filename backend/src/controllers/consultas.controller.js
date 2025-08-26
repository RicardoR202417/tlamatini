// src/controllers/consultas.controller.js
import { Op } from 'sequelize';
import { Cita, Consulta } from '../models/index.js';


export async function crearConsulta(req, res, next) {
  try {
    const { id_cita, descripcion, fecha, id_profesional, id_beneficiario } = req.body;

    // 1) Validaciones básicas
    if (!id_cita) return res.status(422).json({ message: 'id_cita es requerido' });
    if (!descripcion || !descripcion.trim()) {
      return res.status(422).json({ message: 'descripcion es requerida' });
    }

    // 2) La cita debe existir y estar confirmada
    const cita = await Cita.findByPk(id_cita);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });
    if (cita.estado !== 'confirmada') {
      return res.status(400).json({ message: 'la consulta solo puede registrarse cuando la cita está confirmada' });
    }

    // 3) (Opcional) validar que coincidan ids si te los mandan en el body
    if (id_profesional && Number(id_profesional) !== Number(cita.id_profesional)) {
      return res.status(400).json({ message: 'id_profesional no coincide con la cita' });
    }
    if (id_beneficiario && Number(id_beneficiario) !== Number(cita.id_beneficiario)) {
      return res.status(400).json({ message: 'id_beneficiario no coincide con la cita' });
    }

    // 4) Crear consulta SOLO con columnas reales de tu tabla (id_cita, descripcion, fecha)
    const consulta = await Consulta.create({
      id_cita,
      descripcion,
      ...(fecha ? { fecha } : {})
    });

    return res.status(201).json(consulta);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultas?desde=...&hasta=...&beneficiario=...&profesional=...
 * Soporta filtros por rango de fecha y por beneficiario/profesional vía JOIN con Cita.
 */
export async function listarConsultas(req, res, next) {
  try {
    const { desde, hasta, beneficiario, profesional } = req.query;

    const whereConsulta = {};
    if (desde || hasta) {
      whereConsulta.fecha = {};
      if (desde) whereConsulta.fecha[Op.gte] = new Date(desde);
      if (hasta) whereConsulta.fecha[Op.lte] = new Date(hasta);
    }

    // filtros por beneficiario/profesional a través de la cita
    const include = [];
    const whereCita = {};
    if (beneficiario) whereCita.id_beneficiario = Number(beneficiario);
    if (profesional) whereCita.id_profesional = Number(profesional);
    if (Object.keys(whereCita).length > 0) {
      include.push({ model: Cita, as: 'cita', where: whereCita, attributes: ['id_beneficiario','id_profesional'] });
    } else {
      include.push({ model: Cita, as: 'cita', attributes: ['id_beneficiario','id_profesional'] });
    }

    const rows = await Consulta.findAll({
      where: whereConsulta,
      include,
      order: [['fecha','desc']]
    });

    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultas/:id
 */
export async function obtenerConsulta(req, res, next) {
  try {
    const { id } = req.params;
    const row = await Consulta.findByPk(id, {
      include: [{ model: Cita, as: 'cita', attributes: ['id_beneficiario','id_profesional','fecha_hora','estado'] }]
    });
    if (!row) return res.status(404).json({ message: 'consulta no encontrada' });
    return res.json(row);
  } catch (err) {
    next(err);
  }
}