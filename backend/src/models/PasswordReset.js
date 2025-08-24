import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PasswordReset = sequelize.define('PasswordReset', {
  id_reset:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(64), allowNull: false },  // sha256
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used:       { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  used_at:    { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'password_resets',
  timestamps: false
});
