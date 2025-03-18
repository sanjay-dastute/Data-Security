import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

// Determine if we should use SQLite (for local development) or PostgreSQL (for production)
const useSqlite = process.env.DB_TYPE === 'sqlite' || process.env.NODE_ENV === 'development';

const sqliteConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.SQLITE_DATABASE || path.join(process.cwd(), 'quantumtrust.sqlite'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};

const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'quantumtrust',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

export const typeOrmConfig: TypeOrmModuleOptions = useSqlite ? sqliteConfig : postgresConfig;
