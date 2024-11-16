/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('Employments', {
      fields: ['jobTitle', 'experienceId'],
      type: 'unique',
      name: 'unique_job_title_per_experience', // Must match the index name if specified
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Employments', 'unique_job_title_per_experience');
  },
};
