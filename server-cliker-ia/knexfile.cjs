require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
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
    migrations: { 
      tableName: 'knex_migrations', 
      directory: './migrations',
      extension: 'cjs' 
    },
    seeds: { 
      directory: './seeds',
      extension: 'cjs'
    },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: { min: 2, max: 10 },
    migrations: { 
      tableName: 'knex_migrations', 
      directory: './migrations',
      extension: 'cjs' 
    },
    seeds: { 
      directory: './seeds',
      extension: 'cjs'
    },
  },
};
