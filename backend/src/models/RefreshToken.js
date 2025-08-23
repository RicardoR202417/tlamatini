import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const RefreshToken = sequelize.define('refresh_tokens', {
  id_token:   { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  token:      { type: DataTypes.STRING(255), allowNull: false, unique: true },
  expiracion: { type: DataTypes.DATE, allowNull: false },
  revocado:   { type: DataTypes.BOOLEAN, defaultValue: false },
  creado_en:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'refresh_tokens', timestamps: false });
