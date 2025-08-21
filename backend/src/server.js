import { createApp } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import donacionesRoutes from './routes/donaciones.routes.js';

const app = createApp();

app.use('/api', donacionesRoutes);

async function bootstrap() {
  try {
    await sequelize.authenticate();
    app.listen(env.port, () => {
      console.log(`🚀 API TLAMATINI en http://localhost:${env.port}`);
    });
  } catch (e) {
    console.error('❌ Error al iniciar:', e.message);
    process.exit(1);
  }
}

bootstrap();
