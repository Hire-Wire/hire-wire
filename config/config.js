// config/config.js
require('dotenv').config(); // Load environment variables from .env

module.exports = {
  development: {
    username: process.env.MYSQLUSERNAME,     // Use environment variables
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST,
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  test: {
    username: process.env.DB_USER_TEST || 'root',
    password: process.env.DB_PASSWORD_TEST || null,
    database: process.env.DB_NAME_TEST || 'database_test',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: process.env.DB_DIALECT,
  },
};
