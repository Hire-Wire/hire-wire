/*
 * class: JobAppController.js
 * implements: observer.js
 *
 * Manages and observes the current authenticated user, generating JSON data for content generation.
 * JobAppController implements the observer pattern to receive updates on the current user.
 * It prepares structured JSON data to be passed to the LLM class for generating required content based on user details,
 * work experiences, education, job description, and settings.
 */

import Observer from '../interfaces/observer.js';
// TODO: Add imports for llm
// TODO: Add imports for PersistenceManager

class JobAppController extends Observer {

    /**
     * Constructor for JobAppController
     * @param {Object} User - The currently authenticated user object.
     * @param {PersistenceManager} persistenceManager - Instance of PersistenceManager for database queries.
     */
    constructor(User, persistenceManager) {
        super();
        if (!User) throw new Error("JobAppController: User is required for initialization.");
        this.currentUser = User;

        if (!persistenceManager) {
            console.warn("JobAppController: PersistenceManager instance is not provided. Some features may be limited.");
        }
        this.persistenceManager = persistenceManager;
        console.log("JobAppController initialized with user:", this.currentUser);
    }

    /**
     * @override
     * Updates the current user information when notified by the subject.
     * @param {Object} user - The updated user object passed from the subject.
     */
    update(user) {
        if (!user) throw new Error("JobAppController: update method requires a valid user object.");
        this.currentUser = user;
        console.log("JobAppController: currentUser updated", this.currentUser);
    }

    /**
     * Retrieves all experience data for the current user using PersistenceManager.
     * @returns {Array|null} - Array of experience data in JSON format if found; otherwise, null.
     */
    async getExperienceByUserId() {
        if (!this.persistenceManager) {
            throw new Error("JobAppController: PersistenceManager instance is not available.");
        }
        if (!this.currentUser || !this.currentUser.id) {
            throw new Error("JobAppController: currentUser or currentUser.id is not set.");
        }

        try {
            console.log(`JobAppController: Retrieving experiences for user ID ${this.currentUser.id}...`);
            const experiences = await this.persistenceManager.getExperiencesByUserId(this.currentUser.id);

            if (experiences && experiences.length) {
                const experiencesJSON = experiences.map(exp => {
                    if (typeof exp.toJSON === "function") {
                        return exp.toJSON();
                    } else {
                        console.warn(`JobAppController: Experience does not have toJSON method. Skipping entry.`);
                        return null;
                    }
                }).filter(exp => exp !== null);

                console.log("JobAppController: Retrieved and converted experiences to JSON:", experiencesJSON);
                return experiencesJSON;
            } else {
                console.warn(`JobAppController: No experiences found for user ID ${this.currentUser.id}.`);
                return null;
            }
        } catch (error) {
            console.error(`JobAppController: Failed to retrieve experiences for user ID ${this.currentUser.id}:`, error);
            throw new Error(`JobAppController: Error retrieving experiences for user ID ${this.currentUser.id}`);
        }
    }

    /**
     * Generates JSON for basic user details.
     * @returns {Object} - JSON structure containing user details.
     */
    generateUserDetails() {
        console.log("JobAppController: Generating user details JSON...");
        const userDetails = {
            userID: this.currentUser.id,
            firstName: this.currentUser.firstName,
            lastName: this.currentUser.lastName,
            email: this.currentUser.email,
            phone: this.currentUser.phone,
        };
        console.log("JobAppController: Generated user details:", userDetails);
        return userDetails;
    }

    /**
     * Generates JSON array for all work experiences of the current user.
     * Assumes each work experience object has a toJSON() method.
     * @returns {Array} - Array of work experiences in JSON format.
     */
    generateWorkExperiences() {
        console.log("JobAppController: Generating work experiences JSON...");
        const workExperiences = (this.currentUser.workExperiences || []).map(exp => {
            if (typeof exp.toJSON !== "function") {
                throw new Error("JobAppController: Each work experience must have a toJSON method.");
            }
            return exp.toJSON();
        });
        console.log("JobAppController: Generated work experiences:", workExperiences);
        return workExperiences;
    }

    /**
     * Generates JSON array for all educational experiences of the current user.
     * Assumes each education object has a toJSON() method, including the `grade` field.
     * @returns {Array} - Array of education entries in JSON format.
     */
    generateEducations() {
        console.log("JobAppController: Generating educations JSON...");
        const educations = (this.currentUser.educations || []).map(edu => {
            if (typeof edu.toJSON !== "function") {
                throw new Error("JobAppController: Each education entry must have a toJSON method.");
            }
            return edu.toJSON();
        });
        console.log("JobAppController: Generated educations:", educations);
        return educations;
    }

    /**
     * Generates JSON for job description details provided by the front end.
     * @param {Object} jobDescription - Job description data from the front end.
     * @returns {Object} - JSON structure containing job description details.
     */
    generateJobDescription(jobDescription) {
        if (!jobDescription) throw new Error("JobAppController: Job description is required.");

        console.log("JobAppController: Generating job description JSON...");
        const jobDesc = {
            title: jobDescription.title,
            company: jobDescription.company,
            jobRole: jobDescription.jobRole,
            responsibilities: jobDescription.responsibilities,
            requiredSkills: jobDescription.requiredSkills,
            location: jobDescription.location,
        };
        console.log("JobAppController: Generated job description:", jobDesc);
        return jobDesc;
    }

    /**
     * Generates JSON for user settings provided by the front end.
     * This directly includes all settings data as-is.
     * @param {Object} settings - Settings data from the front end.
     * @returns {Object} - JSON structure containing settings.
     */
    generateSettings(settings) {
        if (!settings) throw new Error("JobAppController: Settings data is required.");
        console.log("JobAppController: Generating settings JSON...");
        console.log("JobAppController: Generated settings:", settings);
        return settings;
    }

    /**
     * Combines all JSON components into a complete user data structure for LLM input.
     * Calls individual generator methods for user details, work experiences, educations, job description, and settings.
     * @param {Object} options - JSON object containing settings and job description details.
     * @returns {Object} - Complete JSON data structure including user details, work experiences, education, job description, and settings.
     */
    generateUserDataJSON(options) {
        if (!this.currentUser) {
            throw new Error("JobAppController: No current user set.");
        }

        const { settings, jobDescription } = options;
        if (!settings || !jobDescription) {
            throw new Error("JobAppController: Both settings and job description are required in options.");
        }

        console.log("JobAppController: Generating complete user data JSON...");
        const userData = {
            user: this.generateUserDetails(),
            workExperiences: this.generateWorkExperiences(),
            educations: this.generateEducations(),
            jobDescription: this.generateJobDescription(jobDescription),
            settings: this.generateSettings(settings),
        };
        console.log("JobAppController: Generated complete user data for LLM:", userData);
        return userData;
    }

    /**
     * Triggers content generation in the LLM by passing the generated JSON data.
     * Assumes the LLM class has a generateContent method that accepts JSON input.
     * @param {LLM} llmInstance - Instance of the LLM class responsible for generating content.
     * @param {Object} options - JSON object containing settings and job description details.
     */
    triggerContentGeneration(llmInstance, options) {
        if (!llmInstance) {
            throw new Error("JobAppController: LLM instance is required for content generation.");
        }

        console.log("JobAppController: Triggering content generation...");
        const userDataJSON = this.generateUserDataJSON(options);
        if (userDataJSON) {
            llmInstance.generateContent(userDataJSON);
            console.log("JobAppController: Content generation triggered in LLM");
        }
    }
}

export default JobAppController;
