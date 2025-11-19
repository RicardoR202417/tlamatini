import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Actividad = sequelize.define('Actividad', {
  id_actividad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('banco_alimentos', 'senderismo_terapeutico', 'terapia_psicologica', 'talleres', 'capacitacion', 'deportes'),
    allowNull: false,
  },
  modalidad: {
    type: DataTypes.ENUM('presencial', 'distancia', 'mixta'),
    defaultValue: 'presencial',
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  horario_fin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cupo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'actividades',
  timestamps: false,
});

export default Actividad;
