'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Experiences', {
      id: { 
        type: Sequelize.INTEGER, 
        autoIncrement: true, 
        primaryKey: true, 
        allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'Users', 
          key: 'id', 
        },
        onDelete: 'CASCADE',
      },
      experienceType: { 
        type: Sequelize.ENUM('Education', 'Employment'),
        allowNull: false, 
      },
      organizationName: { 
        type: Sequelize.STRING, 
        allowNull: false, 
        },
      createdAt: {
        allowNull: false, 
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false, 
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Experiences');
  },
};
