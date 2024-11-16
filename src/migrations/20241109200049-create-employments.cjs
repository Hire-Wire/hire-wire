
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      experienceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Experiences',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Employments');
  },
};
