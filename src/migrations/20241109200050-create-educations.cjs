'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Educations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      degree: { type: Sequelize.STRING, allowNull: false },
      fieldOfStudy: { type: Sequelize.STRING, allowNull: false },
      grade: { type: Sequelize.FLOAT, allowNull: true },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: true },
      experienceId: {
        type: Sequelize.INTEGER,
        references: { model: 'Experiences', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Educations');
  },
};
