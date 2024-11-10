'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documents', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      docType: {
        type: Sequelize.ENUM('Resume', 'Cover Letter'),
        allowNull: false,
      },
      docBody: { type: Sequelize.TEXT, allowNull: true },
      jobApplicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'JobApplications', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Documents');
  },
};
