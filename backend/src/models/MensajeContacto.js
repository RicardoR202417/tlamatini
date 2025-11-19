import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MensajeContacto = sequelize.define('MensajeContacto', {
  id_mensaje: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  atendido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mensajes_contacto',
  timestamps: false
});

export default MensajeContacto;
