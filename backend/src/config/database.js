import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Valida variables obligatorias
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter((k) => !process.env[k]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Helpers numéricos seguros
const toInt = (v, def) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

// dialectOptions condicional (no pongas ssl: false)
const dialectOptions = { connectTimeout: 60000 };
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

// Instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
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

// Test de conexión
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', {
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

// Health check
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
