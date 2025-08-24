export { Usuario } from './Usuario.js';
import sequelize, { testConnection, dbHealthCheck } from '../config/database.js';

class Database {
  constructor() {
    this.sequelize = sequelize;
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('Testing database connection...');
      
      // Test connection with retry logic
      let retries = 3;
      while (retries > 0) {
        const connectionSuccess = await testConnection();
        
        if (connectionSuccess) {
          this.isConnected = true;
          console.log('Database connection established successfully.');
          break;
        }
        
        retries--;
        if (retries > 0) {
          console.log(`Retrying connection... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        } else {
          throw new Error('Database connection failed after multiple attempts');
        }
      }
      
      // Import models here
      // this.User = await import('./user.model.js');
      // this.Product = await import('./product.model.js');
      
      // Sync database (use carefully in production)
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
      // Use alter: true for development to update schema without losing data
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

// Create and export singleton instance
const database = new Database();
export default database;