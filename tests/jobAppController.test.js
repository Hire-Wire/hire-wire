/**
 * Test suite for JobAppController
 *
 * This suite verifies the functionality of the JobAppController class, which manages user-related data,
 * including work experiences, education, job descriptions, and settings, and prepares this data in structured
 * JSON format for content generation. As JobAppController observes updates to the authenticated user and
 * depends on unimplemented LLM and PersistenceManager classes, this suite uses mock instances where appropriate
 * and validates graceful error handling for missing dependencies.
 *
 * Key Tests Include:
 *
 * - **User Data Generation**: Confirms that basic user details, work experiences, and educational records
 *   (including the grade field) are correctly formatted as JSON objects.
 *
 * - **Job Description and Settings**: Ensures that provided job descriptions and user settings are accurately
 *   formatted and included in the final JSON output for content generation.
 *
 * - **Comprehensive JSON Generation**: Tests the generation of a complete JSON structure that combines all
 *   components (user details, work experiences, educations, job descriptions, and settings) as expected for
 *   input to the LLM.
 *
 * - **Error Handling**:
 *   - Verifies that an error is thrown if the LLM instance is missing during content generation.
 *   - Tests that a warning is logged if the PersistenceManager instance is unavailable, particularly for methods
 *     that rely on it, such as retrieving user experiences.
 *
 * Note: Since LLM and PersistenceManager are not implemented, this suite either skips or mocks interactions
 * involving these dependencies to focus on the JobAppController's behavior.
 */

// TODO: Update suite in order to test LLM and PersistenceManager after relevant classes are implemented


import JobAppController from '../src/controllers/jobAppController.js';

// Mock classes for testing
class MockWorkExperience {
    constructor(id, companyName, jobTitle, startDate, endDate, description) {
        this.id = id;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
    toJSON() {
        return {
            workExperienceID: this.id,
            companyName: this.companyName,
            jobTitle: this.jobTitle,
            startDate: this.startDate,
            endDate: this.endDate,
            description: this.description,
        };
    }
}

class MockEducation {
    constructor(id, institutionName, degree, startYear, endYear, description, grade) {
        this.id = id;
        this.institutionName = institutionName;
        this.degree = degree;
        this.startYear = startYear;
        this.endYear = endYear;
        this.description = description;
        this.grade = grade;
    }
    toJSON() {
        return {
            educationID: this.id,
            institutionName: this.institutionName,
            degree: this.degree,
            startYear: this.startYear,
            endYear: this.endYear,
            description: this.description,
            grade: this.grade,
        };
    }
}

// Test suite
describe('JobAppController', () => {
    let jobAppController;
    let mockUser;
    let jobDescription;
    let settings;

    beforeEach(() => {
        // Mock user with work experiences and educations
        mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            workExperiences: [
                new MockWorkExperience(101, 'Tech Corp', 'Software Engineer', '2020-01-01', '2023-06-01', 'Developed applications.'),
                new MockWorkExperience(102, 'Web Solutions', 'Frontend Developer', '2018-05-01', '2019-12-31', 'Built and maintained client websites.')
            ],
            educations: [
                new MockEducation(201, 'University of Example', 'BSc in Computer Science', 2013, 2017, 'Studied computer science.', 'A'),
                new MockEducation(202, 'Tech Institute', 'MSc in Software Engineering', 2018, 2020, 'Specialized in software engineering.', 'A+')
            ]
        };

        // Create an instance of JobAppController with the mock user and no PersistenceManager
        jobAppController = new JobAppController(mockUser, null); // Passing `null` for PersistenceManager

        // Mock job description and settings data
        jobDescription = {
            jobID: 301,
            title: 'Frontend Developer',
            company: 'Tech Innovations',
            jobRole: 'Lead Developer',
            responsibilities: ['Develop frontend features', 'Optimize speed'],
            requiredSkills: ['JavaScript', 'React'],
            location: 'Remote'
        };

        settings = {
            includeGPA: true,
            resumePageLength: 2,
            includeCoverLetter: true,
            includePersonalSummary: true,
            generateSkills: true,
            highlightSkillsSection: true
        };
    });

    test('should initialize correctly and log warnings for missing PersistenceManager', () => {
        console.warn = jest.fn();
        new JobAppController(mockUser, null); // Instantiate without PersistenceManager
        expect(console.warn).toHaveBeenCalledWith("JobAppController: PersistenceManager instance is not provided. Some features may be limited.");
    });

    test('should update the current user in update method', () => {
        const newUser = { id: 2, firstName: 'Jane', lastName: 'Smith' };
        jobAppController.update(newUser);
        expect(jobAppController.currentUser).toBe(newUser);
    });

    test('should generate user details in JSON format', () => {
        const userDetails = jobAppController.generateUserDetails();
        expect(userDetails).toEqual({
            userID: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890'
        });
    });

    test('should generate multiple work experiences in JSON format', () => {
        const workExperiences = jobAppController.generateWorkExperiences();
        expect(workExperiences).toEqual([
            {
                workExperienceID: 101,
                companyName: 'Tech Corp',
                jobTitle: 'Software Engineer',
                startDate: '2020-01-01',
                endDate: '2023-06-01',
                description: 'Developed applications.'
            },
            {
                workExperienceID: 102,
                companyName: 'Web Solutions',
                jobTitle: 'Frontend Developer',
                startDate: '2018-05-01',
                endDate: '2019-12-31',
                description: 'Built and maintained client websites.'
            }
        ]);
    });

    test('should generate multiple education details in JSON format, including grade', () => {
        const educations = jobAppController.generateEducations();
        expect(educations).toEqual([
            {
                educationID: 201,
                institutionName: 'University of Example',
                degree: 'BSc in Computer Science',
                startYear: 2013,
                endYear: 2017,
                description: 'Studied computer science.',
                grade: 'A'
            },
            {
                educationID: 202,
                institutionName: 'Tech Institute',
                degree: 'MSc in Software Engineering',
                startYear: 2018,
                endYear: 2020,
                description: 'Specialized in software engineering.',
                grade: 'A+'
            }
        ]);
    });

    test('should generate job description in JSON format', () => {
        const jobDescJSON = jobAppController.generateJobDescription(jobDescription);
        expect(jobDescJSON).toEqual({
            title: 'Frontend Developer',
            company: 'Tech Innovations',
            jobRole: 'Lead Developer',
            responsibilities: ['Develop frontend features', 'Optimize speed'],
            requiredSkills: ['JavaScript', 'React'],
            location: 'Remote'
        });
    });

    test('should generate settings in JSON format', () => {
        const settingsJSON = jobAppController.generateSettings(settings);
        expect(settingsJSON).toEqual(settings);
    });

    test('should generate complete user data JSON with multiple work experiences and educations, including grade', () => {
        const userDataJSON = jobAppController.generateUserDataJSON({ settings, jobDescription });
        expect(userDataJSON).toEqual({
            user: {
                userID: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            },
            workExperiences: [
                {
                    workExperienceID: 101,
                    companyName: 'Tech Corp',
                    jobTitle: 'Software Engineer',
                    startDate: '2020-01-01',
                    endDate: '2023-06-01',
                    description: 'Developed applications.'
                },
                {
                    workExperienceID: 102,
                    companyName: 'Web Solutions',
                    jobTitle: 'Frontend Developer',
                    startDate: '2018-05-01',
                    endDate: '2019-12-31',
                    description: 'Built and maintained client websites.'
                }
            ],
            educations: [
                {
                    educationID: 201,
                    institutionName: 'University of Example',
                    degree: 'BSc in Computer Science',
                    startYear: 2013,
                    endYear: 2017,
                    description: 'Studied computer science.',
                    grade: 'A'
                },
                {
                    educationID: 202,
                    institutionName: 'Tech Institute',
                    degree: 'MSc in Software Engineering',
                    startYear: 2018,
                    endYear: 2020,
                    description: 'Specialized in software engineering.',
                    grade: 'A+'
                }
            ],
            jobDescription: {
                title: 'Frontend Developer',
                company: 'Tech Innovations',
                jobRole: 'Lead Developer',
                responsibilities: ['Develop frontend features', 'Optimize speed'],
                requiredSkills: ['JavaScript', 'React'],
                location: 'Remote'
            },
            settings: settings
        });
    });

    test('should throw an error if LLM instance is missing in triggerContentGeneration', () => {
        expect(() => {
            jobAppController.triggerContentGeneration(null, { settings, jobDescription });
        }).toThrow("JobAppController: LLM instance is required for content generation.");
    });

    test('should throw an error if PersistenceManager is not available in getExperienceByUserId', async () => {
        await expect(jobAppController.getExperienceByUserId()).rejects.toThrow("JobAppController: PersistenceManager instance is not available.");
    });
});
