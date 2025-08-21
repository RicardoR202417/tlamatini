import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import routes from './routes/index.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(compression());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/api', routes);
  app.get('/', (_req, res) => res.send('TLAMATINI API'));
  return app;
}
