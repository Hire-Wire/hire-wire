import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JobDescription = sequelize.define('JobDescription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Job title is required',
        },
        len: {
          args: [2, 100],
          msg: 'Job title should be between 2 and 100 characters',
        },
      },
    },
    jobCompany: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Company name is required',
        },
        len: {
          args: [2, 100],
          msg: 'Company name should be between 2 and 100 characters',
        },
      },
    },
    jobDescriptionBody: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Job description should not exceed 1000 characters',
        },
      },
    },
    jobApplicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'JobApplications',
        key: 'id',
      },
      onDelete: 'CASCADE', // Automatically delete JobDescription if JobApplication is deleted
      onUpdate: 'CASCADE', // Update foreign key if JobApplication ID is updated
      validate: {
        notNull: {
          msg: 'Job application ID is required',
        },
        isInt: {
          msg: 'Job application ID should be an integer',
        },
      },
    },
  }, {
    tableName: 'JobDescriptions',
    timestamps: true,
  });

  JobDescription.associate = (models) => {
    JobDescription.belongsTo(models.JobApplication, {
      foreignKey: {
        name: 'jobApplicationId',
        allowNull: false,
      },
      as: 'JobApplication',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return JobDescription;
};
