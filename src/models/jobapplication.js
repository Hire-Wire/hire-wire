import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JobApplication = sequelize.define('JobApplication', {
    id: {
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
      onUpdate: 'CASCADE', // Update foreign key if User ID is updated
      validate: {
        notNull: {
          msg: 'User ID is required for a Job Application',
        },
        isInt: {
          msg: 'User ID should be an integer value',
        },
      },
    },
  }, {
    tableName: 'JobApplications',
    timestamps: true,
  });

  JobApplication.associate = (models) => {
    // Associate with User
    JobApplication.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // One-to-one relationship with JobDescription
    JobApplication.hasOne(models.JobDescription, {
      foreignKey: 'jobApplicationId',
      as: 'JobDescription',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // One-to-many relationship with Documents
    JobApplication.hasMany(models.Document, {
      foreignKey: 'jobApplicationId',
      as: 'Documents',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return JobApplication;
};
