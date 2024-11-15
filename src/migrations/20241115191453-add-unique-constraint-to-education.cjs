/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('Educations', {
      fields: ['degree', 'experienceId'],
      type: 'unique',
      name: 'unique_degree_per_experience', // Must match the index name if specified
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Educations', 'unique_degree_per_experience');
  },
};
