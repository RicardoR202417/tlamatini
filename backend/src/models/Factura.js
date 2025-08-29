import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Factura = sequelize.define('Factura', {
    id_factura: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_donacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    rfc: {
        type: DataTypes.STRING(13),
        allowNull: false,
    },
    razon_social: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    uso_cfdi: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    metodo_pago: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    forma_pago: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    fecha_emision: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    uuid: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    xml_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pdf_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'facturas',
    timestamps: false,
});

export default Factura;
