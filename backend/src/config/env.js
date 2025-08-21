import 'dotenv/config';

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || 'mysql',
    ssl: String(process.env.DB_SSL || 'false').toLowerCase() === 'true',
    logging: false
  }
};
