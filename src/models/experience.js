//src/models/experience.js 

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Experience = sequelize.define('Experience', {
    ExperienceID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE', //Automatically delete Experience if User is deleted
    },
    ExperienceType: {
      type: DataTypes.ENUM('Education', 'Employment'),
      allowNull: false,
    },
    OrganizationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterOrEqualToStartDate(value) {
            if (this.StartDate && value && value <= this.StartDate) {
                throw new Error('End date must be after or equal to the start date');
            }
        },
      },
    },
  }, {
    tableName: 'Experiences', 
    timestamps: true, // Automatically adds createdAt and updatedAt
  });

  const Employment = sequelize.define('Employment', {
    JobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    JobDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ExperienceID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Experience,
        key: 'ExperienceID',
      },
    },
  });

  const Education = sequelize.define('Education', {
    Degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Grade: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ExperienceID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Experience,
        key: 'ExperienceID',
      },
    },
  });

  Experience.hasMany(Employment, { foreignKey: 'ExperienceID' });
  Experience.hasMany(Education, { foreignKey: 'ExperienceID' });

  Employment.belongsTo(Experience, { foreignKey: 'ExperienceID'});
  Education.belongsTo(Experience, { foreignKey: 'ExperienceID'});

  Experience.associate = (models) => {
  Experience.belongsTo(models.User, {
    foreignKey: 'UserID', 
    as: 'User', 
  });
};

  return {
    Experience,
    Employment,
    Education,
  };
};
