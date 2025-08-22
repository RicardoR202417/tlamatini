import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombres: { type: DataTypes.STRING(100), allowNull: false },
  apellidos: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
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
  celular: { type: DataTypes.STRING(20), allowNull: true },
  direccion: { type: DataTypes.TEXT, allowNull: true },
  foto_perfil: { type: DataTypes.STRING(255), allowNull: true }
}, { 
  tableName: 'usuarios',
  timestamps: false   // 👈 evita que pida createdAt/updatedAt
});
