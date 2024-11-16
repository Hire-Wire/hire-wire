const formatExperience = (experiences) => {
  console.log('[INFO] Starting experience formatting...');
  console.log(`[DEBUG] Raw experiences input: ${JSON.stringify(experiences, null, 2)}`);

  const result = {
    employments: [],
    educations: [],
  };

  experiences.forEach((experience, index) => {
    console.log(`[INFO] Processing experience #${index + 1}`);
    console.log(`[DEBUG] Current experience data: ${JSON.stringify(experience, null, 2)}`);

    if (experience.experienceType === 'Employment') {
      console.log('[INFO] Identified as Employment experience.');

      if (Array.isArray(experience.Employments) && experience.Employments.length > 0) {
        experience.Employments.forEach((employment, employmentIndex) => {
          console.log(`[INFO] Processing Employment #${employmentIndex + 1} for experience #${index + 1}`);
          console.log(`[DEBUG] Employment data: ${JSON.stringify(employment, null, 2)}`);

          const formattedEmployment = {
            jobTitle: employment.jobTitle,
            organizationName: experience.organizationName,
            startDate: employment.startDate
              ? new Date(employment.startDate).toISOString().split('T')[0]
              : 'N/A', // Handle missing or invalid startDate
            endDate: employment.endDate
              ? new Date(employment.endDate).toISOString().split('T')[0]
              : 'N/A', // Handle missing or invalid endDate
            jobDescription: employment.jobDescription || 'No description available',
          };

          console.log(`[DEBUG] Formatted Employment: ${JSON.stringify(formattedEmployment, null, 2)}`);
          result.employments.push(formattedEmployment);
        });
      } else {
        console.warn(`[WARN] No valid Employments found for experience #${index + 1}`);
      }
    } else if (experience.experienceType === 'Education') {
      console.log('[INFO] Identified as Education experience.');

      if (Array.isArray(experience.Education) && experience.Education.length > 0) {
        experience.Education.forEach((education, educationIndex) => {
          console.log(`[INFO] Processing Education #${educationIndex + 1} for experience #${index + 1}`);
          console.log(`[DEBUG] Education data: ${JSON.stringify(education, null, 2)}`);

          const formattedEducation = {
            organizationName: experience.organizationName,
            startDate: education.startDate
              ? new Date(education.startDate).toISOString().split('T')[0]
              : 'N/A', // Handle missing or invalid startDate
            endDate: education.endDate
              ? new Date(education.endDate).toISOString().split('T')[0]
              : 'N/A', // Handle missing or invalid endDate
            fieldOfStudy: education.fieldOfStudy || 'Unknown field of study',
            grade: education.grade !== undefined ? education.grade : 0, // Default to 0 if grade is missing
            degree: education.degree || 'No degree specified',
          };

          console.log(`[DEBUG] Formatted Education: ${JSON.stringify(formattedEducation, null, 2)}`);
          result.educations.push(formattedEducation);
        });
      } else {
        console.warn(`[WARN] No valid Education found for experience #${index + 1}`);
      }
    } else {
      console.warn(`[WARN] Unknown experienceType for experience #${index + 1}: ${experience.experienceType}`);
    }
  });

  console.log('[INFO] Experience formatting completed.');
  console.log(`[DEBUG] Formatted result: ${JSON.stringify(result, null, 2)}`);
  return result;
};

export default formatExperience;
