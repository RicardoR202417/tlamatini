import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombres: { type: DataTypes.STRING(100), allowNull: false },
  apellidos: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(100), allowNull: true, unique: true }, // nullable para soft delete
  password: { type: DataTypes.STRING(255), allowNull: true }, // null si es Google-only
  google_uid: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  tipo_usuario: {
    type: DataTypes.ENUM('beneficiario', 'profesional', 'administrador'),
    allowNull: false
  },
  validado: { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
  genero: {
    type: DataTypes.ENUM('masculino', 'femenino', 'no binario', 'prefiero no decirlo'),
    allowNull: true
  },
  celular: { type: DataTypes.STRING(20), allowNull: true, unique: true }, // nullable para soft delete
  direccion: { type: DataTypes.TEXT, allowNull: true },
  foto_perfil: { type: DataTypes.STRING(255), allowNull: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true }, // campo para soft delete
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true } // indicador de cuenta activa
}, { 
  tableName: 'usuarios',
  timestamps: false,
  paranoid: false // manejamos soft delete manualmente
});
