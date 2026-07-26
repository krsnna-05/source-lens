import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  corsOrigins: string[];
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  jwt: {
    secret: string;
    algorithm: 'HS256';
    accessExpirationHours: number;
    refreshExpirationDays: number;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY || '',
    algorithm: 'HS256',
    accessExpirationHours: Number(process.env.JWT_EXPIRATION_HOURS) || 24,
    refreshExpirationDays: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) || 7,
  },
};

export default config;
