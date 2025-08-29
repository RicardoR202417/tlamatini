import Donacion from '../models/Donacion.js';
import { Usuario } from '../models/Usuario.js';

// Registrar una nueva donación
export const registrarDonacion = async (req, res) => {
    try {
        const { id_usuario, tipo, monto, descripcion, evidencia_url, datos_fiscales } = req.body;

        // Validaciones básicas
        if (!id_usuario || !tipo) {
            return res.status(400).json({ message: 'Faltan datos obligatorios', error: true });
        }

        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado', error: true });
        }

        // Validar tipo de donación
        if (!['monetaria', 'deducible', 'especie'].includes(tipo)) {
            return res.status(400).json({ message: 'Tipo de donación inválido', error: true });
        }

        // Validaciones específicas por tipo de donación usando la nueva función
        const validationResult = validateDonacionByType(tipo, { monto, descripcion, evidencia_url, datos_fiscales });
        if (!validationResult.isValid) {
            return res.status(400).json({
                message: 'Datos de donación inválidos',
                errors: validationResult.errors,
                error: true
            });
        }

        const nuevaDonacion = await Donacion.create({
            id_usuario,
            tipo,
            monto: (tipo === 'especie') ? null : monto,
            descripcion,
            evidencia_url,
            validado: false,
            estado: 'pendiente'
        });

        // Si es donación deducible, crear factura automáticamente
        if (tipo === 'deducible' && datos_fiscales) {
            await crearFacturaAutomatica(nuevaDonacion.id_donacion, datos_fiscales, monto);
        }

        const donacionCompleta = await Donacion.findByPk(nuevaDonacion.id_donacion, {
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
            }]
        });

        res.status(201).json({ 
            message: 'Donación registrada exitosamente', 
            data: donacionCompleta, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar la donación', error: true });
    }
};

// Obtener una donación por ID
export const obtenerDonacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const donacion = await Donacion.findByPk(id, {
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
            }]
        });

        if (!donacion) {
            return res.status(404).json({ message: 'Donación no encontrada', error: true });
        }

        res.status(200).json({ message: 'Donación encontrada', data: donacion, error: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la donación', error: true });
    }
};

// Obtener todas las donaciones de un usuario
export const obtenerDonacionesPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { page = 1, limit = 10, tipo } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = { id_usuario };

        if (tipo && ['monetaria', 'deducible', 'especie'].includes(tipo)) {
            whereClause.tipo = tipo;
        }

        const { count, rows: donaciones } = await Donacion.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']]
        });

        res.status(200).json({ 
            message: 'Donaciones obtenidas exitosamente', 
            data: {
                donaciones,
                totalDonaciones: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las donaciones', error: true });
    }
};

// Validar una donación (solo administradores)
export const validarDonacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { validado } = req.body;

        const donacion = await Donacion.findByPk(id);

        if (!donacion) {
            return res.status(404).json({ message: 'Donación no encontrada', error: true });
        }

        await donacion.update({ validado });

        res.status(200).json({ 
            message: `Donación ${validado ? 'validada' : 'rechazada'} exitosamente`, 
            data: donacion, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al validar la donación', error: true });
    }
};

// Obtener estadísticas de donaciones
export const obtenerEstadisticasDonaciones = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const estadisticas = await Donacion.findAll({
            where: { id_usuario },
            attributes: [
                'tipo',
                [Donacion.sequelize.fn('COUNT', Donacion.sequelize.col('id_donacion')), 'cantidad'],
                [Donacion.sequelize.fn('SUM', Donacion.sequelize.col('monto')), 'total_monto']
            ],
            group: ['tipo'],
            raw: true
        });

        const resumen = {
            total_donaciones: 0,
            total_monto: 0,
            por_tipo: {}
        };

        estadisticas.forEach(stat => {
            resumen.total_donaciones += parseInt(stat.cantidad);
            resumen.total_monto += parseFloat(stat.total_monto || 0);
            resumen.por_tipo[stat.tipo] = {
                cantidad: parseInt(stat.cantidad),
                monto: parseFloat(stat.total_monto || 0)
            };
        });

        res.status(200).json({ 
            message: 'Estadísticas obtenidas exitosamente', 
            data: resumen, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas', error: true });
    }
};

// Función de validación específica por tipo de donación
export const validateDonacionByType = (tipo, data) => {
    const errors = [];

    switch (tipo) {
        case 'monetaria':
            if (!data.monto || data.monto <= 0) {
                errors.push('El monto debe ser mayor a 0 para donaciones monetarias');
            }
            if (data.monto && data.monto > 100000) {
                errors.push('El monto no puede exceder $100,000 MXN');
            }
            break;

        case 'deducible':
            if (!data.monto || data.monto <= 0) {
                errors.push('El monto debe ser mayor a 0 para donaciones deducibles');
            }
            if (!data.datos_fiscales) {
                errors.push('Los datos fiscales son requeridos para donaciones deducibles');
            } else {
                if (!data.datos_fiscales.rfc || data.datos_fiscales.rfc.length < 12) {
                    errors.push('RFC inválido para donación deducible');
                }
                if (!data.datos_fiscales.razon_social || data.datos_fiscales.razon_social.trim() === '') {
                    errors.push('Razón social es requerida para donación deducible');
                }
            }
            break;

        case 'especie':
            if (!data.descripcion || data.descripcion.trim().length < 10) {
                errors.push('La descripción debe tener al menos 10 caracteres para donaciones en especie');
            }
            if (!data.evidencia_url) {
                errors.push('La evidencia fotográfica es requerida para donaciones en especie');
            }
            break;

        default:
            errors.push('Tipo de donación no válido');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Función para crear factura automática
export const crearFacturaAutomatica = async (id_donacion, datos_fiscales, monto) => {
    try {
        const { default: Factura } = await import('../models/Factura.js');
        
        const subtotal = parseFloat(monto);
        const iva = subtotal * 0.16; // 16% IVA
        const total = subtotal + iva;

        const factura = await Factura.create({
            id_donacion,
            folio: `FACT-${Date.now()}`,
            rfc_receptor: datos_fiscales.rfc,
            razon_social_receptor: datos_fiscales.razon_social,
            direccion_receptor: datos_fiscales.direccion || 'Sin dirección específica',
            subtotal,
            iva,
            total,
            estado: 'generada'
        });

        return factura;
    } catch (error) {
        console.error('Error al crear factura automática:', error);
        throw error;
    }
};

// Actualizar validado de donación
export const actualizarValidado = async (req, res) => {
    try {
        const { id } = req.params;
        const { validado, estado } = req.body;

        const donacion = await Donacion.findByPk(id);
        if (!donacion) {
            return res.status(404).json({ message: 'Donación no encontrada', error: true });
        }

        await donacion.update({
            validado: validado !== undefined ? validado : donacion.validado,
            estado: estado || donacion.estado
        });

        res.status(200).json({
            message: 'Donación actualizada exitosamente',
            data: donacion,
            error: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar donación', error: true });
    }
};
