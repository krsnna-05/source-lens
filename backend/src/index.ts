import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import config from './config/config';
import apiRoutes from './routes';

const app = express();

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'sourcelens-backend',
    status: 'running',
    version: process.env.npm_package_version ?? '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api', apiRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});
