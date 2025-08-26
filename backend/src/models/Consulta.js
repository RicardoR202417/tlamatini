// src/models/Consulta.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Consulta = sequelize.define('Consulta', {
  id_consulta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cita: { type: DataTypes.INTEGER, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'consultas',
  timestamps: false
});

export default Consulta;
