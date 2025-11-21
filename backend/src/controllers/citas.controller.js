// src/controllers/citas.controller.js
import { Op } from 'sequelize';
import Cita from '../models/Cita.js';

/**
 * POST /api/citas
 * Crear cita (beneficiario agenda solicitud)
 * Body:
 *  - id_beneficiario (int)
 *  - id_profesional (int)
 *  - fecha_solicitada (ISO 8601)
 *  - motivo (opcional)
 */
export async function crearCita(req, res, next) {
  try {
    const { id_beneficiario, id_profesional, fecha_solicitada, motivo } = req.body;

    if (!id_beneficiario || !id_profesional || !fecha_solicitada) {
      return res.status(400).json({
        message: 'id_beneficiario, id_profesional y fecha_solicitada son obligatorios'
      });
    }

    const cita = await Cita.create({
      id_beneficiario,
      id_profesional,
      fecha_solicitada,
      motivo
    });

    return res.status(201).json(cita);
  } catch (err) {
    console.error('Error en crearCita:', err);
    next(err);
  }
}

/**
 * GET /api/citas
 * Listar citas con filtros:
 *  - desde=YYYY-MM-DD
 *  - hasta=YYYY-MM-DD
 *  - estado=pendiente|confirmada|rechazada|cancelada|atendida
 *  - profesional=id_profesional
 *  - beneficiario=id_beneficiario
 */
export async function listarCitas(req, res, next) {
  try {
    const { desde, hasta, estado, profesional, beneficiario } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (profesional) where.id_profesional = Number(profesional);
    if (beneficiario) where.id_beneficiario = Number(beneficiario);

    if (desde || hasta) {
      where.fecha_solicitada = {};
      if (desde) where.fecha_solicitada[Op.gte] = new Date(desde);
      if (hasta) where.fecha_solicitada[Op.lte] = new Date(hasta);
    }

    const rows = await Cita.findAll({
      where,
      order: [['fecha_solicitada', 'asc']]
    });

    return res.json(rows);
  } catch (err) {
    console.error('Error en listarCitas:', err);
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
    console.error('Error en obtenerCita:', err);
    next(err);
  }
}

/**
 * PUT /api/citas/:id
 * Actualizar cita:
 *  - fecha_solicitada (reprogramar solicitud)
 *  - fecha_confirmada (ajustar horario final)
 *  - motivo
 *  - notas
 */
export async function actualizarCita(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha_solicitada, fecha_confirmada, motivo, notas } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });

    if (fecha_solicitada) cita.fecha_solicitada = fecha_solicitada;
    if (fecha_confirmada) cita.fecha_confirmada = fecha_confirmada;
    if (motivo !== undefined) cita.motivo = motivo;
    if (notas !== undefined) cita.notas = notas;

    await cita.save();
    return res.json(cita);
  } catch (err) {
    console.error('Error en actualizarCita:', err);
    next(err);
  }
}

/**
 * POST /api/citas/:id/confirmar
 * Confirmar cita
 * Body:
 *  - fecha_confirmada (ISO 8601, obligatorio)
 */
export async function confirmarCita(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha_confirmada } = req.body;

    if (!fecha_confirmada) {
      return res
        .status(400)
        .json({ message: 'fecha_confirmada es obligatoria para confirmar la cita' });
    }

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });

    if (['cancelada', 'rechazada', 'atendida'].includes(cita.estado)) {
      return res
        .status(400)
        .json({ message: `no puedes confirmar una cita con estado ${cita.estado}` });
    }

    // evitar doble-booking de citas confirmadas para el mismo profesional y misma hora
    const clash = await Cita.findOne({
      where: {
        id_profesional: cita.id_profesional,
        fecha_confirmada,
        estado: 'confirmada',
        id_cita: { [Op.ne]: cita.id_cita }
      }
    });

    if (clash) {
      return res
        .status(409)
        .json({ message: 'ya existe una cita confirmada en ese horario para el profesional' });
    }

    cita.fecha_confirmada = fecha_confirmada;
    cita.estado = 'confirmada';

    await cita.save();
    return res.json(cita);
  } catch (err) {
    console.error('Error en confirmarCita:', err);
    next(err);
  }
}

/**
 * POST /api/citas/:id/cancelar
 * Cancelar cita
 * Body:
 *  - motivo_cancelacion (opcional)
 */
export async function cancelarCita(req, res, next) {
  try {
    const { id } = req.params;
    const { motivo_cancelacion } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });

    if (cita.estado === 'cancelada') {
      return res.status(200).json(cita); // ya estaba cancelada
    }

    cita.estado = 'cancelada';
    if (motivo_cancelacion) {
      cita.motivo_cancelacion = motivo_cancelacion;
    }

    await cita.save();
    return res.json(cita);
  } catch (err) {
    console.error('Error en cancelarCita:', err);
    next(err);
  }
}

/**
 * POST /api/citas/:id/atender
 * Marcar cita como atendida y registrar notas
 * Body:
 *  - notas (texto de la consulta)
 */
export async function atenderCita(req, res, next) {
  try {
    const { id } = req.params;
    const { notas } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: 'cita no encontrada' });

    if (['cancelada', 'rechazada'].includes(cita.estado)) {
      return res
        .status(400)
        .json({ message: 'no puedes marcar como atendida una cita cancelada o rechazada' });
    }

    if (cita.estado !== 'confirmada') {
      return res.status(400).json({
        message: 'solo puedes marcar como atendida una cita confirmada'
      });
    }

    cita.estado = 'atendida';
    if (notas !== undefined) {
      cita.notas = notas;
    }

    await cita.save();
    return res.json(cita);
  } catch (err) {
    console.error('Error en atenderCita:', err);
    next(err);
  }
}
