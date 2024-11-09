import { DataTypes } from 'sequelize';

export default (sequelize) => {
  // Define JobApplication model
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
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'JobApplications',
    timestamps: true,
  });

  // Define JobDescription model
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
    jobApplicationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: JobApplication,
        key: 'jobApplicationID',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'JobDescriptions',
    timestamps: true,
  });

  // Define Document model
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
    jobApplicationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: JobApplication,
        key: 'jobApplicationID',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'Documents',
    timestamps: true,
  });

  // Define associations
  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User',
    });

    JobApplication.hasOne(models.JobDescription, {
      foreignKey: 'jobApplicationID',
      as: 'JobDescription',
    });

    JobApplication.hasMany(models.Document, {
      foreignKey: 'jobApplicationID',
      as: 'Documents',
    });
  };

  JobDescription.associate = (models) => {
    JobDescription.belongsTo(models.JobApplication, {
      foreignKey: 'jobApplicationID',
      as: 'JobApplication',
    });
  };

  Document.associate = (models) => {
    Document.belongsTo(models.JobApplication, {
      foreignKey: 'jobApplicationID',
      as: 'JobApplication',
    });
  };

  return {
    JobApplication,
    JobDescription,
    Document,
  };
};
