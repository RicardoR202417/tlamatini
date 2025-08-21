import { Usuario } from '../models/index.js';

export async function listarUsuarios(_req, res) {
  try {
    const users = await Usuario.findAll({ limit: 10, order: [['id_usuario', 'ASC']] });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'error al listar usuarios', error: e.message });
  }
}
