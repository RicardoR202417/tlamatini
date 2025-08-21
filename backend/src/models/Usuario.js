import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define(
  'Usuario',
  {
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    tipo_usuario: {
      type: DataTypes.ENUM('beneficiario', 'profesional', 'administrador'),
      allowNull: false
    },
    validado: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: 'usuarios', timestamps: false }
);
