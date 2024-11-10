//src/config-wrapper.cjs

const dotenv = require('dotenv');

console.log("[ src\config\ ]: config-wrapper.cjs is wrapping config.js")

// Load environment variables from .env
dotenv.config();

const config = {
  development: {
    username: process.env.MYSQLUSERNAME,
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER_TEST || 'test_user',
    password: process.env.DB_PASSWORD_TEST || 'test_password',
    database: process.env.DB_NAME_TEST || 'test_db',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  },
};

module.exports = config;
