// src/models/Profesional.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profesional = sequelize.define('Profesional', {
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
    allowNull: false
  },
  cedula_profesional: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  documento_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'profesionales',
  timestamps: false
});

export default Profesional;
