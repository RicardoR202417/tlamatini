import Donacion from '../models/Donacion.js';

// Registrar una nueva donación
export const registrarDonacion = async (req, res) => {
    try {
        const { id_usuario, tipo, monto, descripcion, evidencia_url } = req.body;

        // Validaciones básicas
        if (!id_usuario || !tipo) {
            return res.status(400).json({ message: 'Faltan datos obligatorios', error: true });
        }

        // Validar tipo de donación
        if (!['monetaria', 'deducible', 'especie'].includes(tipo)) {
            return res.status(400).json({ message: 'Tipo de donación inválido', error: true });
        }

        const nuevaDonacion = await Donacion.create({
            id_usuario,
            tipo,
            monto,
            descripcion,
            evidencia_url,
        });

        res.status(201).json({ message: 'Donación registrada exitosamente', data: nuevaDonacion, error: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar la donación', error: true });
    }
};

// Obtener una donación por ID
export const obtenerDonacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const donacion = await Donacion.findByPk(id);

        if (!donacion) {
            return res.status(404).json({ message: 'Donación no encontrada', error: true });
        }

        res.status(200).json({ message: 'Donación encontrada', data: donacion, error: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la donación', error: true });
    }
};
