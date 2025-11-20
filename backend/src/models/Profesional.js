import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Profesional = sequelize.define('profesionales', {
  id_profesional: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    },
    onDelete: 'CASCADE'
  },
  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: true // opcional al inicio
  },
  cedula_profesional: {
    type: DataTypes.STRING(50),
    allowNull: true // opcional al inicio
  },
  documento_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'profesionales',
  timestamps: false
});
