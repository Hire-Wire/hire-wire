// src/models/Education.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Education = sequelize.define('Education', {
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldOfStudy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade: {
      type: DataTypes.FLOAT,
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
    tableName: 'Educations',
    timestamps: true,
  });

  Education.associate = (models) => {
    Education.belongsTo(models.Experience, { foreignKey: 'experienceId' });
  };

  return Education;
};
