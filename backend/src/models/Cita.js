import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cita = sequelize.define('Cita', {
  id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_beneficiario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_profesional: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // 👉 Antes: fecha_hora
  // Ahora: fecha_solicitada (la que propone el beneficiario)
  fecha_solicitada: {
    type: DataTypes.DATE,
    allowNull: false
  },

  // 👉 Fecha/hora que define el profesional al confirmar
  fecha_confirmada: {
    type: DataTypes.DATE,
    allowNull: true
  },

  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'confirmada',
      'rechazada',
      'cancelada',
      'atendida'
    ),
    allowNull: false,
    defaultValue: 'pendiente'
  },

  // 👉 Motivo que escribe el beneficiario al pedir la cita
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // 👉 Notas de la consulta (las llena el profesional al atender)
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // 👉 Motivo de rechazo/cancelación
  motivo_cancelacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  actualizado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'citas',
  timestamps: false // usamos creado_en / actualizado_en personalizados
});

export default Cita;
