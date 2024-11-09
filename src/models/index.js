import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import configFile from '../config/config.js';

const basename = path.basename(fileURLToPath(import.meta.url));
const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const initializeModels = async () => {
  const files = fs.readdirSync(__dirname).filter(file => (
    file.indexOf('.') !== 0
    && file !== basename
    && file.slice(-3) === '.js'
    && file.indexOf('.test.js') === -1
  ));

  // Import models asynchronously
  for (const file of files) {
    const modelModule = await import(path.join(__dirname, file));
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }

  // Set up associations after all models have been loaded
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
};

// Use an Immediately Invoked Async Function Expression (IIFE) to allow top-level await
await initializeModels();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
