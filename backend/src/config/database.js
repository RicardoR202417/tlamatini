import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.pass, {
  host: env.db.host,
  port: env.db.port,
  dialect: env.db.dialect,
  logging: env.db.logging,
  dialectOptions: env.db.ssl ? { ssl: { require: true } } : {}
});

export async function dbPing() {
  await sequelize.authenticate();
}

export default sequelize;
