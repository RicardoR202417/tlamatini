import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../models/Usuario.js';
import crypto from 'crypto';
import { RefreshToken } from '../models/RefreshToken.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
