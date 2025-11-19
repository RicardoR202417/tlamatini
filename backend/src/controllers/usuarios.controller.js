import { Usuario } from '../models/index.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export async function listarUsuarios(_req, res) {
  try {
    const users = await Usuario.findAll({ limit: 10, order: [['id_usuario', 'ASC']] });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'error al listar usuarios', error: e.message });
  }
}

// Obtener perfil completo del usuario autenticado
export async function getProfile(req, res) {
  try {
    const userId = req.user.id_usuario;
    
    console.log('=== GET PROFILE DEBUG ===');
    console.log('User ID:', userId);
    
    const user = await Usuario.findByPk(userId, {
      attributes: { exclude: ['password', 'google_uid'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('Usuario encontrado en BD:', user.toJSON());
    console.log('=== END GET PROFILE DEBUG ===');
    
    return res.json({
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario,
        fecha_nacimiento: user.fecha_nacimiento,
        genero: user.genero,
        celular: user.celular,
        direccion: user.direccion,
        foto_perfil: user.foto_perfil,
        validado: user.validado,
        fecha_registro: user.fecha_registro
      }
    });
  } catch (e) {
    console.error('Error en getProfile:', e);
    return res.status(500).json({ 
      message: 'Error al obtener perfil', 
      error: e.message 
    });
  }
}

// Validaciones para actualizar perfil
export const validateUpdateProfile = [
  body('nombres').optional().trim().notEmpty().withMessage('nombres no puede estar vacío'),
  body('apellidos').optional().trim().notEmpty().withMessage('apellidos no puede estar vacío'),
  body('correo').optional().trim().isEmail().withMessage('correo debe ser una dirección de email válida'),
  body('fecha_nacimiento').optional({ checkFalsy: true }).isISO8601().withMessage('fecha_nacimiento debe ser una fecha válida'),
  body('genero').optional({ checkFalsy: true }).isIn(['masculino', 'femenino', 'no binario', 'prefiero no decirlo']).withMessage('genero inválido'),
  body('celular').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 20 }).withMessage('celular debe tener entre 10 y 20 caracteres'),
  body('direccion').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('direccion muy larga (máximo 500 caracteres)'),
];

// Actualizar perfil del usuario
export async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id_usuario; // Viene del middleware de autenticación
    const {
      nombres,
      apellidos,
      correo,
      fecha_nacimiento,
      genero,
      celular,
      direccion
    } = req.body;

    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Buscar el usuario
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar unicidad del correo si se está actualizando
    if (correo !== undefined && correo !== user.correo) {
      const existingEmailUser = await Usuario.findOne({
        where: {
          correo: correo.trim()
        }
      });
      
      if (existingEmailUser) {
        return res.status(409).json({ 
          message: 'El correo electrónico ya está en uso por otro usuario',
          field: 'correo'
        });
      }
    }

    // Verificar unicidad del celular si se está actualizando
    if (celular !== undefined && celular !== null && celular.trim() && celular.trim() !== user.celular) {
      const existingPhoneUser = await Usuario.findOne({
        where: {
          celular: celular.trim()
        }
      });
      
      if (existingPhoneUser) {
        return res.status(409).json({ 
          message: 'El número de celular ya está en uso por otro usuario',
          field: 'celular'
        });
      }
    }

    // Construir objeto de actualización
    const updateData = {};
    
    // Campos requeridos - siempre deben tener valor
    if (nombres !== undefined && nombres !== null && nombres.trim()) {
      updateData.nombres = nombres.trim();
    }
    if (apellidos !== undefined && apellidos !== null && apellidos.trim()) {
      updateData.apellidos = apellidos.trim();
    }
    if (correo !== undefined && correo !== null && correo.trim()) {
      updateData.correo = correo.trim();
    }
    
    // Campos opcionales - pueden ser null
    if (fecha_nacimiento !== undefined) {
      updateData.fecha_nacimiento = fecha_nacimiento || null;
    }
    if (genero !== undefined) {
      updateData.genero = genero || null;
    }
    if (celular !== undefined) {
      updateData.celular = celular ? celular.trim() : null;
    }
    if (direccion !== undefined) {
      updateData.direccion = direccion ? direccion.trim() : null;
    }

    console.log('Datos a actualizar:', updateData);

    // Si no hay datos para actualizar, devolver error informativo
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No se recibieron datos para actualizar. Verifica que los datos se estén enviando correctamente.'
      });
    }

    // Actualizar usuario en la base de datos
    await user.update(updateData);
    
    // Obtener el usuario actualizado
    const updatedUser = await Usuario.findByPk(userId, {
      attributes: { exclude: ['password', 'google_uid'] }
    });
    
    return res.json({ 
      message: 'Perfil actualizado correctamente', 
      user: updatedUser.toJSON()
    });

  } catch (e) {
    console.error('Error general en updateProfile:', e);
    
    // Manejo específico de errores de unicidad de la base de datos
    if (e.name === 'SequelizeUniqueConstraintError') {
      const field = e.errors[0]?.path;
      let message = 'Error de duplicación de datos';
      
      if (field === 'correo') {
        message = 'El correo electrónico ya está en uso por otro usuario';
      } else if (field === 'celular') {
        message = 'El número de celular ya está en uso por otro usuario';
      }
      
      return res.status(409).json({ 
        message,
        field,
        error: 'duplicate_entry'
      });
    }
    
    return res.status(500).json({ 
      message: 'Error al actualizar perfil', 
      error: e.message,
      stack: e.stack
    });
  }
}

// Validaciones para cambio de contraseña
export const validateChangePassword = [
  body('contrasena_actual').trim().notEmpty().withMessage('La contraseña actual es requerida'),
  body('nueva_contrasena').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener mínimo 8 caracteres'),
];

// Cambiar contraseña del usuario
export async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id_usuario;
    const { contrasena_actual, nueva_contrasena } = req.body;

    console.log('=== CHANGE PASSWORD DEBUG ===');
    console.log('User ID:', userId);

    // Buscar el usuario
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el usuario tiene contraseña (no es solo Google Auth)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'Este usuario fue registrado con Google. No es posible cambiar la contraseña.',
        error: 'google_auth_user'
      });
    }

    // Verificar que la contraseña actual es correcta
    const isCurrentPasswordValid = await bcrypt.compare(contrasena_actual, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        message: 'La contraseña actual es incorrecta',
        error: 'invalid_current_password'
      });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const isSamePassword = await bcrypt.compare(nueva_contrasena, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'La nueva contraseña debe ser diferente a la actual',
        error: 'same_password'
      });
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(nueva_contrasena, saltRounds);

    // Actualizar la contraseña en la base de datos
    await user.update({ password: hashedNewPassword });

    console.log('Contraseña actualizada exitosamente para user ID:', userId);
    console.log('=== END CHANGE PASSWORD DEBUG ===');

    return res.json({ 
      message: 'Contraseña actualizada correctamente',
      success: true
    });

  } catch (e) {
    console.error('Error en changePassword:', e);
    return res.status(500).json({ 
      message: 'Error al cambiar la contraseña', 
      error: e.message 
    });
  }
}
