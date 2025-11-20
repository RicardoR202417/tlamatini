import { Op } from 'sequelize';
import { Profesional } from '../models/Profesional.js';
// import { Usuario } from '../models/Usuario.js'; // si quieres join con datos del usuario

export async function crear(req, res, next) {
  try {
    const { id_profesional, especialidad, cedula_profesional, documento_url } = req.body;
    const row = await Profesional.create({ id_profesional, especialidad, cedula_profesional, documento_url });
    res.status(201).json(row);
  } catch (e) { next(e); }
}

export async function listar(req, res, next) {
  try {
    const { q, especialidad, page = 1, limit = 20 } = req.query;
    const where = {};
    if (especialidad) where.especialidad = especialidad;
    if (q) where.cedula_profesional = { [Op.like]: `%${q}%` };

    const rows = await Profesional.findAndCountAll({
      where, offset: (page-1)*limit, limit: Number(limit), order: [['id_profesional','asc']]
    });
    res.json({ total: rows.count, page: Number(page), limit: Number(limit), data: rows.rows });
  } catch (e) { next(e); }
}

export async function obtener(req, res, next) {
  try {
    const { id } = req.params;
    const row = await Profesional.findByPk(id);
    if (!row) return res.status(404).json({ message: 'profesional no encontrado' });
    res.json(row);
  } catch (e) { next(e); }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { especialidad, cedula_profesional, documento_url } = req.body;
    const row = await Profesional.findByPk(id);
    if (!row) return res.status(404).json({ message: 'profesional no encontrado' });

    if (especialidad !== undefined) row.especialidad = especialidad;
    if (cedula_profesional !== undefined) row.cedula_profesional = cedula_profesional;
    if (documento_url !== undefined) row.documento_url = documento_url;

    await row.save();
    res.json(row);
  } catch (e) { next(e); }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    const row = await Profesional.findByPk(id);
    if (!row) return res.status(404).json({ message: 'profesional no encontrado' });
    await row.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
}
