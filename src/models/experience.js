// src/models/Experience.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Experience = sequelize.define('Experience', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    experienceType: {
      type: DataTypes.ENUM('Education', 'Employment'),
      allowNull: false,
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'Experiences',
    timestamps: true,
  });

  // Association with User and other models will be set up in a centralized manner
  Experience.associate = (models) => {
    Experience.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User',
    });
    Experience.hasMany(models.Employment, { foreignKey: 'experienceId' });
    Experience.hasMany(models.Education, { foreignKey: 'experienceId' });
  };

  return Experience;
};
