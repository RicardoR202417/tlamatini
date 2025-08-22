// server.js (raíz del backend)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// BD: default export y helpers nombrados
import sequelize, { testConnection, dbHealthCheck } from './src/config/database.js';

// Rutas
import authRoutes from './src/routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

/* ===== Middlewares ===== */
app.use(helmet());
app.use(express.json());

// CORS dinámico desde .env (coma-separado)
const allowList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowList.length === 0 || allowList.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin no permitido: ' + origin));
  },
  credentials: true
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ===== Rutas ===== */
app.get('/', (_req, res) => res.send('Servidor funcionando 🚀'));
app.get('/health', async (_req, res) => {
  const db = await dbHealthCheck();
  res.status(db.healthy ? 200 : 503).json({ ok: db.healthy, db, time: new Date().toISOString() });
});

// Base /api → auth: /api/register, /api/login, /api/google, /api/me
app.use('/api', authRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('❌', err?.message || err);
  res.status(500).json({ message: 'Error interno', detail: err?.message || String(err) });
});

/* ===== Arranque ===== */
(async () => {
  try {
    console.log('[BOOT] Probando conexión a BD…');
    const ok = await testConnection();
    if (!ok) throw new Error('DB auth failed');

    // Si usarás sync de modelos, hazlo aquí (no en prod con force):
    // await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`✅ API corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('🚫 Error fatal al iniciar:', err?.message || err);
    process.exit(1);
  }
})();

/* ===== Hooks ===== */
process.on('unhandledRejection', e => console.error('[unhandledRejection]', e));
process.on('uncaughtException', e => console.error('[uncaughtException]', e));
