import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Sequelize } from 'sequelize';
import configFile from '../config/config.js';
import User from './user.js';
import Experience from './experience.js';
import Employment from './employment.js';
import Education from './education.js';
import JobApplication from './jobapplication.js';
import JobDescription from './jobdescription.js';
import Document from './document.js';

// // Define the current directory and file paths
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = configFile[env];
// const db = {};
//
// // Initialize Sequelize instance
// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
//
// // Function to initialize models
// const initializeModels = async () => {
//   const files = fs.readdirSync(__dirname).filter(file => (
//     file.indexOf('.') !== 0
//       && file !== basename
//       && file.slice(-3) === '.js'
//       && file.indexOf('.test.js') === -1
//   ));
//
//   for (const file of files) {
//     // Use `pathToFileURL` to handle file path as a `file://` URL
//     const modelPath = pathToFileURL(path.join(__dirname, file)).href;
//     const modelModule = await import(modelPath);
//     const model = modelModule.default(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   }
//
//   Object.keys(db).forEach((modelName) => {
//     if (db[modelName].associate) {
//       db[modelName].associate(db);
//     }
//   });
//
//   console.log('Loaded models:', Object.keys(db));
// };
//
// // Initialize models asynchronously inside an IIFE to avoid top-level await
// (async () => {
//   await initializeModels();
// })();
//
// const initializeDatabase = async () => {
//   await initializeModels();
//   db.sequelize = sequelize;
//   db.Sequelize = Sequelize;
//
// };
//
// await initializeDatabase();

// export default db;

//-----------------------------------------------------------------------------------------

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

// Initialize Sequelize instance
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// Load models explicitly and initialize them
db.User = User(sequelize, Sequelize.DataTypes);
db.Experience = Experience(sequelize, Sequelize.DataTypes);
db.Employment = Employment(sequelize, Sequelize.DataTypes);
db.Education = Education(sequelize, Sequelize.DataTypes);
db.JobApplication = JobApplication(sequelize, Sequelize.DataTypes);
db.JobDescription = JobDescription(sequelize, Sequelize.DataTypes);
db.Document = Document(sequelize, Sequelize.DataTypes);

// Set up associations between models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Attach Sequelize instance and Sequelize library to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// console.log('Loaded models:', Object.keys(db));

export default db;
