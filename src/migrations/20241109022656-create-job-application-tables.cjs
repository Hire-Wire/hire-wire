/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create JobApplications table
    await queryInterface.createTable('JobApplications', {
      jobApplicationID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
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

    // Create JobDescriptions table
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

    // Create Documents table
    await queryInterface.createTable('Documents', {
      docId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      docType: {
        type: Sequelize.ENUM('Resume', 'Cover Letter'),
        allowNull: false,
      },
      docBody: {
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

  async down(queryInterface) {
    // Drop tables in reverse order to avoid foreign key conflicts
    await queryInterface.dropTable('Documents');
    await queryInterface.dropTable('JobDescriptions');
    await queryInterface.dropTable('JobApplications');
  },
};
