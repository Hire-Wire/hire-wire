
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('JobDescriptions', {
      jobDescriptionID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobCompany: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobDescriptionBody: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jobApplicationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'JobApplications',
          key: 'jobApplicationID',
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('JobDescriptions');
  }
};
