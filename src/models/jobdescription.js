import { DataTypes } from 'sequelize';

export default (sequelize) => {
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
        model: 'JobApplications',
        key: 'jobApplicationID',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'JobDescriptions',
    timestamps: true,
  });

  JobDescription.associate = (models) => {
    JobDescription.belongsTo(models.JobApplication, {
      foreignKey: 'jobApplicationID',
      as: 'JobApplication',
    });
  };

  return JobDescription;
};
