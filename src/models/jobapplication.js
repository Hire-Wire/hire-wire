import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DB_URI); // Replace with your database URI

// JobApplication Model
const JobApplication = sequelize.define('JobApplication', {
  jobApplicationID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE', // Automatically delete JobApplication if User is deleted
  },
});

// JobDescription Model
const JobDescription = sequelize.define('JobDescription', {
  jobDescriptionID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobCompany: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobDescriptionBody: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Document Model
const Document = sequelize.define('Document', {
  docId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  docType: {
    type: DataTypes.ENUM('Resume', 'Cover Letter'),
    allowNull: false,
  },
  docBody: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Define Model Relationships
JobApplication.hasOne(JobDescription, { foreignKey: 'jobApplicationID' });
JobDescription.belongsTo(JobApplication, { foreignKey: 'jobApplicationID' });

JobApplication.hasMany(Document, { foreignKey: 'jobApplicationID' });
Document.belongsTo(JobApplication, { foreignKey: 'jobApplicationID' });

// Export the models and Sequelize instance
export { sequelize, JobApplication, JobDescription, Document };
