/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('Educations', {
      fields: ['degree', 'fieldOfStudy', 'experienceId'],
      type: 'unique',
      name: 'unique_degree_and_field_of_study_per_experience',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'Educations', 'unique_degree_and_field_of_study_per_experience'
    );
  },
};
