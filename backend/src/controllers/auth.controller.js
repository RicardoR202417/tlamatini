import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../models/Usuario.js';
import crypto from 'crypto';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';


function signToken(user) {
  const payload = {
    id_usuario: user.id_usuario,
    tipo_usuario: user.tipo_usuario,
    nombres: user.nombres,
    apellidos: user.apellidos,
    correo: user.correo
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

/** VALIDACIONES */
export const validateRegister = [
  body('nombres').trim().notEmpty().withMessage('nombres requerido'),
  body('apellidos').trim().notEmpty().withMessage('apellidos requerido'),
  body('correo').isEmail().withMessage('correo inválido'),
  body('password').isLength({ min: 8 }).withMessage('password mínimo 8 caracteres'),
  body('tipo_usuario').isIn(['beneficiario', 'profesional']).withMessage('tipo_usuario inválido'),
];

export const validateLogin = [
  body('correo').isEmail().withMessage('correo inválido'),
  body('password').notEmpty().withMessage('password requerido'),
];

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { nombres, apellidos, correo, password, tipo_usuario } = req.body;

  try {
    // NUNCA permitir admin por aquí
    if (tipo_usuario === 'administrador') {
      return res.status(403).json({ message: 'No permitido' });
    }

    const exists = await Usuario.findOne({ where: { correo } });
    if (exists) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await Usuario.create({
      nombres,
      apellidos,
      correo: correo.toLowerCase(),
      password: hash,
      tipo_usuario,     // beneficiario | profesional
      validado: true    // puedes dejarlo en true o manejar validación por correo más adelante
    });

   const token = signToken(user);
const refresh_token = await issueRefreshToken(user.id_usuario); 
return res.status(201).json({
  message: 'Registro exitoso',
  token,
  refresh_token,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error en servidor', detail: e.message });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { correo, password } = req.body;

  try {
    const user = await Usuario.findOne({ where: { correo: correo.toLowerCase() } });
    if (!user || !user.password) {
      // password puede ser null si se registró solo con Google
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signToken(user);
const refresh_token = await issueRefreshToken(user.id_usuario);
    return res.json({
      message: 'Login exitoso',
       token,
  refresh_token,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error en servidor', detail: e.message });
  }
}

/**
 * Google Sign-In
 * Body: { id_token, tipo_usuario? } 
 * - Verifica el id_token.
 * - Vincula o crea usuario.
 * - No permite crear "administrador" por esta vía.
 */
export async function googleSignIn(req, res) {
  const { id_token, tipo_usuario } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: 'id_token requerido' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const google_uid = payload.sub;               // ID único de Google
    const correo = (payload.email || '').toLowerCase();
    const nombres = payload.given_name || payload.name || 'Usuario';
    const apellidos = payload.family_name || '';
    const foto = payload.picture || null;
    const email_verified = payload.email_verified;

    if (!correo) {
      return res.status(400).json({ message: 'El token no incluye correo' });
    }
    if (!email_verified) {
      return res.status(401).json({ message: 'Correo no verificado por Google' });
    }

    // 1) ¿Existe por google_uid?
    let user = await Usuario.findOne({ where: { google_uid } });

    // 2) ¿Existe por correo?
    if (!user) {
      user = await Usuario.findOne({ where: { correo } });

      if (user) {
        // Vincular Google si aún no está vinculado
        if (!user.google_uid) {
          user.google_uid = google_uid;
          if (!user.foto_perfil && foto) user.foto_perfil = foto;
          await user.save();
        }
      } else {
        // Crear usuario nuevo: default beneficiario si no envían tipo_usuario
        const tipo = (tipo_usuario === 'profesional') ? 'profesional' : 'beneficiario';
        user = await Usuario.create({
          nombres,
          apellidos,
          correo,
          password: null,        // Google-only
          google_uid,
          tipo_usuario: tipo,     // NO se permite administrador aquí
          validado: true,
          foto_perfil: foto
        });
      }
    }

    const token = signToken(user);
const refresh_token = await issueRefreshToken(user.id_usuario);
    return res.json({
      message: 'Login con Google exitoso',
      token,
       refresh_token,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario,
        foto_perfil: user.foto_perfil || null
      }
    });
  } catch (e) {
    return res.status(401).json({ message: 'Token de Google inválido', detail: e.message });
  }
}

export async function me(req, res) {
  // req.user viene del JWT
  return res.json({ user: req.user });
}


/* Emite refresh con tus nombres de columnas */
async function issueRefreshToken(id_usuario, ttlDays = 30) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiracion = new Date(Date.now() + ttlDays*24*60*60*1000);
  await RefreshToken.create({ id_usuario, token, expiracion });
  return token;
}

/* Rotación: marca revocado=1 y crea uno nuevo */
async function rotateRefreshToken(oldToken) {
  const rt = await RefreshToken.findOne({ where: { token: oldToken } });
  if (!rt) return null;
  if (rt.revocado) return null;
  if (new Date(rt.expiracion) < new Date()) return null;

  rt.revocado = true;
  await rt.save();

  return issueRefreshToken(rt.id_usuario);
}

/* Revocar explícitamente */
async function revokeRefreshToken(tokenStr) {
  const rt = await RefreshToken.findOne({ where: { token: tokenStr } });
  if (!rt) return false;
  rt.revocado = true;
  await rt.save();
  return true;
}
export async function refresh(req, res) {
  try {
    const { refresh_token } = req.body || {};
    if (!refresh_token) return res.status(400).json({ message: 'refresh_token requerido' });

    // rotación (revoca el antiguo y emite uno nuevo)
    const newRefresh = await rotateRefreshToken(refresh_token);
    if (!newRefresh) return res.status(401).json({ message: 'refresh_token inválido o expirado' });

    // busca el usuario dueño del RT viejo para emitir nuevo access token
    const old = await RefreshToken.findOne({ where: { token: refresh_token } })
      .catch(() => null);
    // Si no encuentras el viejo (pudo ser ya borrado), busca por el nuevo
    const rt = old || await RefreshToken.findOne({ where: { token: newRefresh } });
    if (!rt) return res.status(401).json({ message: 'refresh_token inválido' });

    const userId = rt.id_usuario;
    const user = await Usuario.findByPk(userId);
    if (!user) return res.status(401).json({ message: 'usuario no encontrado' });

    const access = signToken(user);
    return res.json({
      message: 'Refresh exitoso',
      token: access,
      refresh_token: newRefresh
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error en servidor', detail: e.message });
  }
}
export async function logout(req, res) {
  try {
    const { refresh_token } = req.body || {};
    if (!refresh_token) return res.status(400).json({ message: 'refresh_token requerido' });

    const ok = await revokeRefreshToken(refresh_token);
    if (!ok) return res.status(200).json({ message: 'Sesión finalizada' }); // idempotente

    return res.json({ message: 'Logout exitoso' });
  } catch (e) {
    return res.status(500).json({ message: 'Error en servidor', detail: e.message });
  }
}



const sha256Hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
const minutesFromNow = (m) => { const d = new Date(); d.setMinutes(d.getMinutes() + m); return d; };

/** POST /auth/forgot  Body: { correo } */
export async function forgotPassword(req, res) {
  try {
    const { correo } = req.body || {};
    if (!correo) return res.status(400).json({ mensaje: 'correo es requerido' });

    // respuesta genérica (no exponemos si existe o no)
    const ok = { mensaje: 'Si el correo existe, se enviará un enlace para restablecer la contraseña.' };

    const user = await Usuario.findOne({ where: { correo } });
    if (!user) return res.status(200).json(ok);

    // invalidar tokens previos no usados de este usuario (higiene)
    await PasswordReset.update(
      { used: true, used_at: new Date() },
      { where: { id_usuario: user.id_usuario, used: false } }
    );

    const rawToken = crypto.randomBytes(32).toString('hex'); // token que irá por correo
    const tokenHash = sha256Hex(rawToken);                   // solo guardamos el hash
    const ttl = parseInt(process.env.RESET_TOKEN_TTL_MIN || '15', 10);

    await PasswordReset.create({
      id_usuario: user.id_usuario,
      token_hash: tokenHash,
      expires_at: minutesFromNow(ttl)
    });

    const linkFront = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${rawToken}&uid=${user.id_usuario}`;
    const subject = 'Restablecer contraseña';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5">
        <h2>${process.env.APP_NAME || 'Aplicación'}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><strong>Este enlace expira en ${ttl} minutos.</strong></p>
        <p><a href="${linkFront}" target="_blank">Haz clic aquí para restablecer tu contraseña</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `;
    await sendResetPasswordEmail({ to: correo, subject, html });

    return res.status(200).json(ok);
  } catch (err) {
    console.error('[forgotPassword] error', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

/** POST /auth/reset  Body: { token, uid, password } */
export async function resetPassword(req, res) {
  try {
    const { token, uid, password } = req.body || {};
    if (!token || !uid || !password) {
      return res.status(400).json({ mensaje: 'token, uid y password son requeridos' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ mensaje: 'la contraseña debe tener al menos 8 caracteres' });
    }

    const tokenHash = sha256Hex(token);

    const pr = await PasswordReset.findOne({
      where: {
        id_usuario: uid,
        token_hash: tokenHash,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    if (!pr) return res.status(400).json({ mensaje: 'token inválido o expirado' });

    const user = await Usuario.findOne({ where: { id_usuario: uid } });
    if (!user) return res.status(400).json({ mensaje: 'usuario no encontrado' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    pr.used = true;
    pr.used_at = new Date();
    await pr.save();

    // (opcional pero recomendado) invalidar refresh tokens activos
    if (RefreshToken) {
      await RefreshToken.destroy({ where: { id_usuario: uid } });
    }

    return res.status(200).json({ mensaje: 'contraseña actualizada correctamente' });
  } catch (err) {
    console.error('[resetPassword] error', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

/**
 * ENDPOINT DE DEBUG - Devuelve un token válido para desarrollo
 * GET /api/auth/debug-token
 * Solo funciona en desarrollo (NODE_ENV=development)
 */
export async function getDebugToken(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Endpoint solo disponible en desarrollo' });
  }

  try {
    // Buscar o crear usuario de test
    let user = await Usuario.findOne({ where: { correo: 'test@dev.com' } });
    
    if (!user) {
      // Crear usuario de test si no existe
      const hashedPassword = await bcrypt.hash('test123456', 10);
      user = await Usuario.create({
        nombres: 'Test',
        apellidos: 'Developer',
        correo: 'test@dev.com',
        password: hashedPassword,
        tipo_usuario: 'beneficiario',
        validado: true
      });
    }

    // Generar token válido
    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Token de desarrollo generado',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Error al generar token de debug:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar token',
      error: error.message
    });
  }
}
