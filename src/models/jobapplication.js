import { DataTypes } from 'sequelize';

export default (sequelize) => {
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

  return JobApplication;
};
