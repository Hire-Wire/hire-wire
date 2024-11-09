'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Experiences', {
      ExperienceID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'id',
        },
        onDelete: 'CASCADE', // Automatically delete Experience if User is deleted
      },
      ExperienceType: {
        type: Sequelize.ENUM('Education', 'Employment'),
        allowNull: false,
      },
      OrganizationName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      StartDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      EndDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Employments', {
      ExperienceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Experiences',
          key: 'ExperienceID',
        },
      },
      JobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      JobDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Educations', {
      ExperienceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Experiences',
          key: 'ExperienceID',
        },
      },
      Degree: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Grade: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Educations');
    await queryInterface.dropTable('Employments');
    await queryInterface.dropTable('Experiences');
  },
};
