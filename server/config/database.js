const { Sequelize } = require('sequelize');
require('dotenv').config();

// Prioritize individual variables, then DATABASE_URL, then a safe default/error
const dbName = process.env.DB_NAME || 'cutinow';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASS || 'postgres';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
  });
}

module.exports = sequelize;
