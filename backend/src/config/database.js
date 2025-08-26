import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Carga .env desde la raíz del backend sin depender del cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Helpers
const mask = (v) => (v ? '*'.repeat(Math.max(2, String(v).length - 2)) : '(empty)');
const toInt = (v, def) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

// Validación estricta (incluye PASS)
const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_HOST', 'DB_PORT', 'DB_PASS'];
const missing = requiredEnv.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// SSL opcional
const dialectOptions = { connectTimeout: 60000 };
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

// Log útil (enmascarado) para confirmar que SÍ se leyó DB_PASS
console.log('[DB] Config ->', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: mask(process.env.DB_PASS),
  passLen: (process.env.DB_PASS || '').length,
  dialect: process.env.DB_DIALECT || 'mysql',
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, // sin fallback a vacío
  {
    host: process.env.DB_HOST,
    port: toInt(process.env.DB_PORT, 3306),
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    dialectOptions,
    pool: {
      max: toInt(process.env.DB_POOL_MAX, 5),
      min: toInt(process.env.DB_POOL_MIN, 0),
      acquire: toInt(process.env.DB_POOL_ACQUIRE, 60000),
      idle: toInt(process.env.DB_POOL_IDLE, 10000),
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
  }
);

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB: conexión OK');
    return true;
  } catch (error) {
    console.error('❌ DB: fallo de conexión:', {
      name: error?.name,
      message: error?.message,
      code: error?.original?.code,
      errno: error?.original?.errno,
      sqlState: error?.original?.sqlState,
      address: error?.original?.address,
      port: error?.original?.port,
      fatal: error?.original?.fatal,
    });
    return false;
  }
}

export async function dbHealthCheck() {
  try {
    const [result] = await sequelize.query('select 1 as health_check');
    return { healthy: true, result };
  } catch (error) {
    return { healthy: false, error: error?.message };
  }
}

export { sequelize };
export default sequelize;
