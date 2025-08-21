import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Donacion = sequelize.define('Donacion', {
    id_donacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('monetaria', 'deducible', 'especie'),
        allowNull: false,
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    evidencia_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    validado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'donaciones',
    timestamps: false,
});

export default Donacion;
