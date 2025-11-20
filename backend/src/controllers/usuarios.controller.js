import { Usuario, Profesional } from '../models/index.js';
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
    
    // Configurar las opciones de búsqueda base
    const findOptions = {
      where: { 
        id_usuario: userId,
        is_active: true // Solo usuarios activos
      },
      attributes: { exclude: ['password', 'google_uid'] }
    };

    // Si el usuario es profesional, incluir datos de la tabla profesionales
    const user = await Usuario.findOne(findOptions);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Construir respuesta base
    let userProfile = {
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
    };

    // Si es profesional, obtener datos adicionales
    if (user.tipo_usuario === 'profesional') {
      console.log('Usuario es profesional, buscando datos adicionales...');
      
      const profesional = await Profesional.findOne({
        where: { id_profesional: userId }
      });

      console.log('Datos de profesional encontrados:', profesional ? profesional.toJSON() : 'No encontrado');

      if (profesional) {
        userProfile.profesional = {
          especialidad: profesional.especialidad,
          cedula_profesional: profesional.cedula_profesional,
          documento_url: profesional.documento_url
        };
      } else {
        // Si no existe registro de profesional, crearlo
        console.log('Creando registro de profesional...');
        const newProfesional = await Profesional.create({
          id_profesional: userId,
          especialidad: null,
          cedula_profesional: null,
          documento_url: null
        });
        
        userProfile.profesional = {
          especialidad: null,
          cedula_profesional: null,
          documento_url: null
        };
        console.log('Registro de profesional creado:', newProfesional.toJSON());
      }
    }
    
    console.log('Usuario encontrado en BD - Tipo:', user.tipo_usuario);
    console.log('Perfil completo a retornar:', JSON.stringify(userProfile, null, 2));
    console.log('=== END GET PROFILE DEBUG ===');
    
    return res.json({
      user: userProfile
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
  
  // Validaciones para campos de profesional
  body('especialidad').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('especialidad muy larga (máximo 100 caracteres)'),
  body('cedula_profesional').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('cédula profesional muy larga (máximo 50 caracteres)'),
  body('documento_url').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('documento_url muy largo (máximo 255 caracteres)'),
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
      direccion,
      // Campos específicos de profesional
      especialidad,
      cedula_profesional,
      documento_url
    } = req.body;

    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Buscar el usuario
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Tipo de usuario:', user.tipo_usuario);

    // Verificar unicidad del correo si se está actualizando
    if (correo !== undefined && correo !== user.correo) {
      const existingEmailUser = await Usuario.findOne({
        where: {
          correo: correo.trim(),
          is_active: true
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
          celular: celular.trim(),
          is_active: true
        }
      });
      
      if (existingPhoneUser) {
        return res.status(409).json({ 
          message: 'El número de celular ya está en uso por otro usuario',
          field: 'celular'
        });
      }
    }

    // Construir objeto de actualización para tabla usuarios
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

    console.log('Datos a actualizar en tabla usuarios:', updateData);

    // Actualizar usuario en la base de datos si hay datos
    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
      console.log('Usuario actualizado');
    }

    // Si es profesional y hay campos de profesional para actualizar
    if (user.tipo_usuario === 'profesional') {
      console.log('=== ACTUALIZANDO DATOS DE PROFESIONAL ===');
      console.log('Campos de profesional recibidos:', { especialidad, cedula_profesional, documento_url });
      
      const profesionalUpdateData = {};
      
      if (especialidad !== undefined) {
        profesionalUpdateData.especialidad = especialidad ? especialidad.trim() : null;
        console.log('Procesando especialidad:', profesionalUpdateData.especialidad);
      }
      if (cedula_profesional !== undefined) {
        profesionalUpdateData.cedula_profesional = cedula_profesional ? cedula_profesional.trim() : null;
        console.log('Procesando cedula_profesional:', profesionalUpdateData.cedula_profesional);
      }
      if (documento_url !== undefined) {
        profesionalUpdateData.documento_url = documento_url ? documento_url.trim() : null;
        console.log('Procesando documento_url:', profesionalUpdateData.documento_url);
      }

      console.log('Datos finales a actualizar en tabla profesionales:', profesionalUpdateData);

      if (Object.keys(profesionalUpdateData).length > 0) {
        try {
          // Buscar registro de profesional
          const profesional = await Profesional.findOne({
            where: { id_profesional: userId }
          });

          console.log('Registro de profesional encontrado:', profesional ? 'SÍ' : 'NO');

          if (profesional) {
            console.log('Datos actuales del profesional:', profesional.toJSON());
            const result = await profesional.update(profesionalUpdateData);
            console.log('Resultado de actualización:', result.toJSON());
            console.log('Datos de profesional actualizados exitosamente');
          } else {
            console.log('Creando nuevo registro de profesional...');
            const newProfesional = await Profesional.create({
              id_profesional: userId,
              ...profesionalUpdateData
            });
            console.log('Nuevo registro de profesional creado:', newProfesional.toJSON());
          }
        } catch (profesionalError) {
          console.error('Error al actualizar datos de profesional:', profesionalError);
          throw profesionalError;
        }
      } else {
        console.log('No hay campos de profesional para actualizar');
      }
      console.log('=== FIN ACTUALIZACIÓN DATOS DE PROFESIONAL ===');
    }

    // Verificar que se recibieron datos para actualizar
    const totalFields = Object.keys(updateData).length + 
                       (user.tipo_usuario === 'profesional' ? 
                        Object.keys({
                          ...(especialidad !== undefined && { especialidad }),
                          ...(cedula_profesional !== undefined && { cedula_profesional }),
                          ...(documento_url !== undefined && { documento_url })
                        }).length : 0);

    if (totalFields === 0) {
      return res.status(400).json({
        message: 'No se recibieron datos para actualizar. Verifica que los datos se estén enviando correctamente.'
      });
    }

    // Obtener el usuario actualizado con datos de profesional si aplica
    const updatedUser = await Usuario.findByPk(userId, {
      attributes: { exclude: ['password', 'google_uid'] }
    });

    let responseUser = {
      id_usuario: updatedUser.id_usuario,
      nombres: updatedUser.nombres,
      apellidos: updatedUser.apellidos,
      correo: updatedUser.correo,
      tipo_usuario: updatedUser.tipo_usuario,
      fecha_nacimiento: updatedUser.fecha_nacimiento,
      genero: updatedUser.genero,
      celular: updatedUser.celular,
      direccion: updatedUser.direccion,
      foto_perfil: updatedUser.foto_perfil,
      validado: updatedUser.validado,
      fecha_registro: updatedUser.fecha_registro
    };

    // Si es profesional, incluir datos de profesional
    if (updatedUser.tipo_usuario === 'profesional') {
      const profesionalData = await Profesional.findOne({
        where: { id_profesional: userId }
      });

      if (profesionalData) {
        responseUser.profesional = {
          especialidad: profesionalData.especialidad,
          cedula_profesional: profesionalData.cedula_profesional,
          documento_url: profesionalData.documento_url
        };
      }
    }
    
    return res.json({ 
      message: 'Perfil actualizado correctamente', 
      user: responseUser
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

// Validaciones para eliminar cuenta
export const validateDeleteAccount = [
  body('confirmacion').equals('ELIMINAR').withMessage('Debe escribir exactamente "ELIMINAR" para confirmar'),
];

// Eliminar cuenta del usuario (soft delete)
export async function deleteAccount(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id_usuario;
    const { confirmacion } = req.body;

    console.log('=== DELETE ACCOUNT DEBUG ===');
    console.log('User ID:', userId);
    console.log('Confirmación recibida:', confirmacion);

    // Buscar el usuario
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el usuario esté activo
    if (!user.is_active || user.deleted_at) {
      return res.status(400).json({ 
        message: 'La cuenta ya ha sido eliminada previamente',
        error: 'account_already_deleted'
      });
    }

    console.log('Usuario encontrado - Tipo:', user.tipo_usuario);
    console.log('Datos actuales del usuario:', {
      correo: user.correo,
      celular: user.celular,
      is_active: user.is_active
    });

    // Datos sensibles a eliminar (establecer como NULL)
    const sensitiveDataCleared = {
      correo: null,
      celular: null,
      direccion: null,
      password: null,
      fecha_nacimiento: null,
      foto_perfil: null,
      genero: null,
      google_uid: null, // también limpiamos Google UID
      is_active: false,
      deleted_at: new Date()
    };

    // Datos que se CONSERVAN para auditoría:
    // - nombres, apellidos, tipo_usuario, fecha_registro, validado, id_usuario

    console.log('Datos sensibles a eliminar:', sensitiveDataCleared);

    // Actualizar usuario con soft delete
    await user.update(sensitiveDataCleared);

    // Si es profesional, también aplicar soft delete a datos de profesional
    if (user.tipo_usuario === 'profesional') {
      console.log('Aplicando soft delete a datos de profesional...');
      
      const profesional = await Profesional.findOne({
        where: { id_profesional: userId }
      });

      if (profesional) {
        // Limpiar datos sensibles de profesional
        const profesionalSensitiveDataCleared = {
          especialidad: null,
          cedula_profesional: null,
          documento_url: null
        };

        await profesional.update(profesionalSensitiveDataCleared);
        console.log('Datos de profesional eliminados');
      }
    }

    console.log('Cuenta eliminada exitosamente (soft delete)');
    console.log('=== END DELETE ACCOUNT DEBUG ===');

    return res.json({ 
      message: 'Cuenta eliminada exitosamente. Sus datos sensibles han sido eliminados de forma segura.',
      success: true,
      deleted_at: sensitiveDataCleared.deleted_at,
      info: 'Solo se conservan nombres, apellidos y tipo de usuario para propósitos de auditoría.'
    });

  } catch (e) {
    console.error('Error en deleteAccount:', e);
    return res.status(500).json({ 
      message: 'Error al eliminar la cuenta', 
      error: e.message 
    });
  }
}
