import { Actividad, Inscripcion, Usuario } from '../models/index.js';

// @desc Obtener todas las actividades
// @route GET /api/actividades
// @access Public
export const obtenerActividades = async (req, res) => {
  try {
    const actividades = await Actividad.findAll({
      order: [['fecha', 'ASC']],
      include: [
        {
          model: Inscripcion,
          as: 'inscripciones',
          attributes: ['id_inscripcion', 'id_usuario'],
          required: false,
        }
      ]
    });

    res.json({
      success: true,
      data: actividades,
      message: 'Actividades obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

// @desc Obtener una actividad por ID
// @route GET /api/actividades/:id
// @access Public
export const obtenerActividadPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const actividad = await Actividad.findByPk(id, {
      include: [
        {
          model: Inscripcion,
          as: 'inscripciones',
          attributes: ['id_inscripcion', 'id_usuario'],
          required: false,
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
            }
          ]
        }
      ]
    });

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    res.json({
      success: true,
      data: actividad,
      message: 'Actividad obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad',
      error: error.message
    });
  }
};

// @desc Crear nueva actividad (admin)
// @route POST /api/actividades
// @access Private (Admin)
export const crearActividad = async (req, res) => {
  try {
    const { titulo, descripcion, tipo, modalidad, fecha, horario_inicio, horario_fin, ubicacion, cupo } = req.body;

    // Validaciones
    if (!titulo || !tipo || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona título, tipo y fecha'
      });
    }

    const actividad = await Actividad.create({
      titulo,
      descripcion,
      tipo,
      modalidad,
      fecha,
      horario_inicio,
      horario_fin,
      ubicacion,
      cupo
    });

    res.status(201).json({
      success: true,
      data: actividad,
      message: 'Actividad creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear actividad',
      error: error.message
    });
  }
};

// @desc Actualizar actividad (admin)
// @route PUT /api/actividades/:id
// @access Private (Admin)
export const actualizarActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo, modalidad, fecha, horario_inicio, horario_fin, ubicacion, cupo } = req.body;

    const actividad = await Actividad.findByPk(id);

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    await actividad.update({
      titulo: titulo || actividad.titulo,
      descripcion: descripcion || actividad.descripcion,
      tipo: tipo || actividad.tipo,
      modalidad: modalidad || actividad.modalidad,
      fecha: fecha || actividad.fecha,
      horario_inicio: horario_inicio || actividad.horario_inicio,
      horario_fin: horario_fin || actividad.horario_fin,
      ubicacion: ubicacion || actividad.ubicacion,
      cupo: cupo || actividad.cupo
    });

    res.json({
      success: true,
      data: actividad,
      message: 'Actividad actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar actividad',
      error: error.message
    });
  }
};

// @desc Eliminar actividad (admin)
// @route DELETE /api/actividades/:id
// @access Private (Admin)
export const eliminarActividad = async (req, res) => {
  try {
    const { id } = req.params;

    const actividad = await Actividad.findByPk(id);

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    await actividad.destroy();

    res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar actividad',
      error: error.message
    });
  }
};

// @desc Inscribir usuario a actividad
// @route POST /api/actividades/:idActividad/inscripciones
// @access Private
export const inscribirseEnActividad = async (req, res) => {
  try {
    const { idActividad } = req.params;
    const userId = req.user?.id_usuario; // Del middleware de autenticación

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Validar que la actividad existe
    const actividad = await Actividad.findByPk(idActividad);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Validar que el usuario existe
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si ya existe inscripción
    const inscripcionExistente = await Inscripcion.findOne({
      where: { id_usuario: userId, id_actividad: idActividad }
    });

    if (inscripcionExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás inscrito en esta actividad'
      });
    }

    // Tomar datos del body si fueron enviados desde el formulario
    const { nombre: bodyNombre, apellido: bodyApellido, correo: bodyCorreo, telefono: bodyTelefono } = req.body || {};

    const nombreFinal = bodyNombre || usuario.nombres || '';
    const apellidoFinal = bodyApellido || usuario.apellidos || '';
    const correoFinal = bodyCorreo || usuario.correo || '';
    const telefonoFinal = typeof bodyTelefono !== 'undefined' ? bodyTelefono : (usuario.celular || '');

    // Validar que los campos requeridos para la tabla estén presentes (evitar errores SQL)
    if (!nombreFinal || !apellidoFinal || !correoFinal) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, apellido y correo para completar la inscripción'
      });
    }

    // Crear inscripción (llenando los campos requeridos por la tabla)
    const inscripcion = await Inscripcion.create({
      id_usuario: userId,
      id_actividad: idActividad,
      nombre_actividad: actividad.titulo,
      nombre: nombreFinal,
      apellido: apellidoFinal,
      correo: correoFinal,
      telefono: telefonoFinal
    });

    res.status(201).json({
      success: true,
      data: inscripcion,
      message: 'Inscripción realizada exitosamente'
    });
  } catch (error) {
    console.error('Error al inscribirse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inscribirse en la actividad',
      error: error.message
    });
  }
};

// @desc Cancelar inscripción
// @route DELETE /api/actividades/inscripciones/:idInscripcion
// @access Private
export const cancelarInscripcion = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const userId = req.user?.id_usuario;

    const inscripcion = await Inscripcion.findByPk(idInscripcion);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Verificar que el usuario sea dueño de la inscripción
    if (inscripcion.id_usuario !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta inscripción'
      });
    }

    await inscripcion.destroy();

    res.json({
      success: true,
      message: 'Inscripción cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar inscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar inscripción',
      error: error.message
    });
  }
};

// @desc Obtener inscripciones del usuario
// @route GET /api/usuarios/:idUsuario/inscripciones
// @access Private
export const obtenerInscripcionesUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const inscripciones = await Inscripcion.findAll({
      where: { id_usuario: idUsuario },
      include: [
        {
          model: Actividad,
          as: 'actividad',
          attributes: ['id_actividad', 'titulo', 'descripcion', 'tipo', 'fecha']
        }
      ],
      order: [['fecha_inscripcion', 'DESC']]
    });

    res.json({
      success: true,
      data: inscripciones,
      message: 'Inscripciones obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones',
      error: error.message
    });
  }
};
