import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inscripcion = sequelize.define('Inscripcion', {
  id_inscripcion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario',
    },
  },
  id_actividad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'actividades',
      key: 'id_actividad',
    },
  },
  fecha_inscripcion: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  nombre_actividad: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('inscrito','cancelado','completado'),
    allowNull: true,
    defaultValue: 'inscrito'
  },
  fecha_cancelacion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'inscripciones',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_usuario', 'id_actividad'],
    },
  ],
});

export default Inscripcion;
