// src/controllers/citas.controller.js
// Controlador de Citas — CRUD + confirmación/cancelación
// Nota: exportamos TODO por nombre para que no haya "callback undefined" en las rutas.

import { Op } from 'sequelize';
import Cita from '../models/Cita.js';

/**
 * POST /api/citas
 * Crea una cita (beneficiario agenda)
 */
export async function crearCita(req, res, next) {
  try {
    const { id_beneficiario, id_profesional, fecha_hora, notas } = req.body;

    // Evita doble-booking exacto por profesional en el mismo minuto
    const clash = await Cita.findOne({ where: { id_profesional, fecha_hora } });
    if (clash) {
      return res
        .status(409)
        .json({ message: 'ya existe una cita en ese horario para el profesional' });
    }

    const cita = await Cita.create({ id_beneficiario, id_profesional, fecha_hora, notas });
    return res.status(201).json(cita);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/citas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=...&profesional=...&beneficiario=...
 * Lista citas con filtros
 */
export async function listarCitas(req, res, next) {
  try {
    const { desde, hasta, estado, profesional, beneficiario } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (profesional) where.id_profesional = Number(profesional);
    if (beneficiario) where.id_beneficiario = Number(beneficiario);

    if (desde || hasta) {
      where.fecha_hora = {};
      if (desde) where.fecha_hora[Op.gte] = new Date(desde);
      if (hasta) where.fecha_hora[Op.lte] = new Date(hasta);
    }

    const rows = await Cita.findAll({ where, order: [['fecha_hora', 'asc']] });
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/citas/:id
 * Detalle de una cita
 */
export async function obtenerCita(req, res, next) {
  try {
    const { id } = req.params;
    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });
    return res.json(cita);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/citas/:id
 * Reprogramar / actualizar notas
 */
export async function actualizarCita(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha_hora, notas } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });

    if (fecha_hora) {
      // valida que el nuevo horario no choque si cambias el slot
      const clash = await Cita.findOne({
        where: { id_profesional: cita.id_profesional, fecha_hora }
      });
      if (clash && clash.id_cita !== cita.id_cita) {
        return res
          .status(409)
          .json({ message: 'ya existe una cita en ese horario para el profesional' });
      }
      cita.fecha_hora = fecha_hora;
    }

    if (notas !== undefined) cita.notas = notas;

    await cita.save();
    return res.json(cita);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/citas/:id/confirmar
 * Confirmar cita (profesional)
 */
export async function confirmarCita(req, res, next) {
  try {
    const { id } = req.params;
    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });
    if (cita.estado === 'cancelada') {
      return res.status(400).json({ message: 'no puedes confirmar una cita cancelada' });
    }
    if (cita.estado === 'confirmada') {
      return res.status(200).json(cita); // ya estaba confirmada
    }

    cita.estado = 'confirmada';
    await cita.save();
    return res.json(cita);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/citas/:id/cancelar
 * Cancelar cita (profesional o beneficiario)
 */
export async function cancelarCita(req, res, next) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });
    if (cita.estado === 'cancelada') return res.status(200).json(cita); // ya estaba cancelada

    cita.estado = 'cancelada';
    cita.notas = [cita.notas, motivo].filter(Boolean).join('\n');
    await cita.save();
    return res.json(cita);
  } catch (err) {
    next(err);
  }
}
