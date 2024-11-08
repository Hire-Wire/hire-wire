// src/models/Employment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Employment = sequelize.define('Employment', {
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterOrEqualToStartDate(value) {
          if (this.startDate && value && (value <= this.startDate)) {
            throw new Error('End date must be after or equal to the start date');
          }
        },
      },
    },
    experienceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Experiences',
        key: 'id',
      },
    },
  }, {
    tableName: 'Employments',
    timestamps: true,
  });

  Employment.associate = (models) => {
    Employment.belongsTo(models.Experience, { foreignKey: 'experienceId' });
  };

  return Employment;
};
