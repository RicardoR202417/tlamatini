// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import database, { testConnection } from './src/models/index.js';
import routes from './src/routes/index.js';
import { validatePaymentConfig } from './src/config/payments.js';

const app = express();
const PORT = process.env.PORT || 4000;

/* ===== Middlewares ===== */
app.use(helmet());
app.use(express.json());

// Servir archivos estáticos (evidencias)
app.use('/uploads', express.static('uploads'));

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
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

app.use((err, _req, res, _next) => {
  console.error('❌', err?.message || err);
  res.status(500).json({ message: 'Error interno', detail: err?.message || String(err) });
});

/* ===== Arranque ===== */
(async () => {
  try {
    console.log('[BOOT] Probando conexión a BD…');
    await database.initialize();

    console.log('[BOOT] Validando configuración de pagos…');
    validatePaymentConfig();

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
