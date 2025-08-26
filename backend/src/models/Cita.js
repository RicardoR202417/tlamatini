import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const Cita = sequelize.define('Cita', {
id_cita: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
id_beneficiario: { type: DataTypes.INTEGER, allowNull: false },
id_profesional: { type: DataTypes.INTEGER, allowNull: false },
fecha_hora: { type: DataTypes.DATE, allowNull: false },
estado: {
type: DataTypes.ENUM('pendiente','confirmada','cancelada'),
defaultValue: 'pendiente'
},
notas: { type: DataTypes.TEXT },
creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
tableName: 'citas',
timestamps: false
});


export default Cita;