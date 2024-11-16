const formatExperience = (experiences) => {
  const result = {
    employments: [],
    educations: [],
  };

  experiences.forEach((experience) => {
    if (experience.experienceType === 'Employment') {
      if (Array.isArray(experience.Employments) && experience.Employments.length > 0) {
        experience.Employments.forEach((employment) => {
          const formattedEmployment = {
            jobTitle: employment.jobTitle,
            organizationName: experience.organizationName,
            startDate: employment.startDate
              ? new Date(employment.startDate).toISOString().split('T')[0]
              : 'N/A',
            endDate: employment.endDate
              ? new Date(employment.endDate).toISOString().split('T')[0]
              : 'N/A',
            jobDescription: employment.jobDescription || 'No description available',
          };
          result.employments.push(formattedEmployment);
        });
      }
    } else if (experience.experienceType === 'Education') {
      if (Array.isArray(experience.Education) && experience.Education.length > 0) {
        experience.Education.forEach((education) => {
          const formattedEducation = {
            organizationName: experience.organizationName,
            startDate: education.startDate
              ? new Date(education.startDate).toISOString().split('T')[0]
              : 'N/A',
            endDate: education.endDate
              ? new Date(education.endDate).toISOString().split('T')[0]
              : 'N/A',
            fieldOfStudy: education.fieldOfStudy || 'Unknown field of study',
            grade: education.grade !== undefined ? education.grade : 0,
            degree: education.degree || 'No degree specified',
          };
          result.educations.push(formattedEducation);
        });
      }
    }
  });

  return result;
};

export default formatExperience;
