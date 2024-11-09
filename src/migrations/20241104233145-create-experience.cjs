/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Experiences', {
      id: {
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
      },
    });

    // Create Employment table
    await queryInterface.createTable('Employments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      experienceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Experiences',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isAfterOrEqualToStartDate(value) {
            if (this.StartDate && value && value <= this.StartDate) {
              throw new Error('End date must be after or equal to the start date');
            }
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Education table
    await queryInterface.createTable('Educations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      experienceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Experiences',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fieldOfStudy: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grade: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isAfterOrEqualToStartDate(value) {
            if (this.StartDate && value && value <= this.StartDate) {
              throw new Error('End date must be after or equal to the start date');
            }
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Educations');
    await queryInterface.dropTable('Employments');
    await queryInterface.dropTable('Experiences');
  },
};
