// src/models/index.js

// BD (instancia y helpers)
import sequelize, { testConnection, dbHealthCheck } from '../config/database.js';

// Modelos
export { Usuario } from './Usuario.js';           // asume export nombrado en Usuario.js
import Cita from './Cita.js';
import Consulta from './Consulta.js';
import Profesional from './Profesional.js';
import Donacion from './Donacion.js';
import Factura from './Factura.js';

// Exporta modelos por si los necesitas individualmente
export { default as Cita } from './Cita.js';
export { default as Consulta } from './Consulta.js';
export { default as Profesional } from './Profesional.js';
export { default as Donacion } from './Donacion.js';
export { default as Factura } from './Factura.js';

// ===== Asociaciones =====
import { Usuario } from './Usuario.js';

// Asociaciones existentes (descomenta si las necesitas)
// Cita.belongsTo(Usuario, { foreignKey: 'id_beneficiario', as: 'beneficiario' });
// Cita.belongsTo(Profesional, { foreignKey: 'id_profesional' });
// Consulta.belongsTo(Cita, { foreignKey: 'id_cita' });

// Asociaciones para donaciones
Donacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasMany(Donacion, { foreignKey: 'id_usuario', as: 'donaciones' });

// Asociaciones para facturas
Factura.belongsTo(Donacion, { foreignKey: 'id_donacion', as: 'donacion' });
Donacion.hasOne(Factura, { foreignKey: 'id_donacion', as: 'factura' });

// =====================================================================================
// Clase de arranque/control de BD con reintentos para conexión en frío.
// =====================================================================================
class Database {
  constructor() {
    this.sequelize = sequelize;
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('Testing database connection...');

      let retries = 3;
      while (retries > 0) {
        const ok = await testConnection();
        if (ok) {
          this.isConnected = true;
          console.log('Database connection established successfully.');
          break;
        }
        retries--;
        if (retries > 0) {
          console.log(`Retrying connection... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw new Error('Database connection failed after multiple attempts');
        }
      }

      // Sincronización solo en desarrollo (evita romper prod)
      if (process.env.NODE_ENV === 'development') {
        await this.syncDatabase();
      }

      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async syncDatabase() {
    try {
      // Usa alter en desarrollo si requieres ajustar columnas sin dropear:
      // await this.sequelize.sync({ alter: true });
      console.log('Database models synced successfully');
    } catch (error) {
      console.error('Database sync failed:', error);
    }
  }

  async dbHealthCheck() {
    return await dbHealthCheck();
  }

  async close() {
    try {
      await this.sequelize.close();
      this.isConnected = false;
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

// Instancia única para usar en server.js
const database = new Database();

// Exports
export {
  sequelize,        // por si ocupas la instancia cruda
  testConnection,   // para pruebas directas de conexión si las necesitas
  dbHealthCheck,    // health endpoint
};
export default database;
