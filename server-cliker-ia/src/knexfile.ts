import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'clicker_game',
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations', directory: './migrations' },
    seeds: { directory: './seeds' },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations', directory: './migrations' },
    seeds: { directory: './seeds' },
  },
};

export default config;
