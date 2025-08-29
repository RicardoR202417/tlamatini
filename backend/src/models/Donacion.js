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
    // ====================================
    // PAYMENT FIELDS
    // ====================================
    metodo_pago: {
        type: DataTypes.ENUM('paypal', 'mercadopago', 'transferencia', 'efectivo'),
        allowNull: true,
    },
    estado_pago: {
        type: DataTypes.ENUM('pendiente', 'completado', 'rechazado', 'cancelado'),
        defaultValue: 'pendiente',
    },
    fecha_pago: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // PayPal fields
    paypal_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paypal_capture_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // MercadoPago fields
    mercadopago_preference_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mercadopago_payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Additional payment data
    moneda: {
        type: DataTypes.STRING(3),
        defaultValue: 'MXN',
    },
    comision: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    // Fiscal data for deductible donations
    rfc: {
        type: DataTypes.STRING(13),
        allowNull: true,
    },
    razon_social: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    uso_cfdi: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
}, {
    tableName: 'donaciones',
    timestamps: false,
});

export default Donacion;
