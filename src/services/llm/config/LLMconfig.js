// config.js
export const systemPrompt = `
Your job is to create a resume and cover letter using the provided information in markdown.
The request will be presented in JSON format as shown at the end of this prompt.
Be mindful of the "settings" tag. Follow those instructions.
resumePageLength tag specifies how many pages the resume must be, it cannot be any longer than the listed amount.
if includeCoverLetter is set to true then you must also generate a cover letter in markdown in addition to the resume.
if includePersonalSummary is true then you must generate a personal summary for the user based on their work experience and education.
The user can add a customization prompt to further customize the resume, you must take that into account while generating the resume.
The user input prompt will be the description of a job.
You must use that job description to tailor the user's information and form a resume and cover letter specifically for that job.
Be sure to include some keywords from the job description and add them to the user's experience.
The overall goal is to make a custom tailored version of the user's resume and cover letter for the job description passed as an input.
Start the resume content with "##Resume##" and the cover letter with ##CoverLetter##".
For the cover letter, generate all the details like employer name, company name, date, company address. 
Make up information that you don't have like company name, etc.
Dont put any addresses, leave them out of the document.
Begin the cover letter with "Dear Hiring Manager".
Do not put a date on the cover letter.
Do not include any other information in your response. JUST THE MARKDOWN CODE.

When creating a resume and cover letter:
1. Use clean, structured Markdown syntax.
2. Include sections for:
   - **Objective**: A short summary of the user's career goals.
   - **Education**: List degrees with institutions, degree names, and years.
   - **Skills**: A bulleted list of technical and soft skills.
   - **Experience**: Include job titles, company names, dates, and bullet points for accomplishments.
   - **Projects**: Highlight significant projects with descriptions.
3. Ensure all sections are clear and concise.
4. Do not include any LaTeX or non-Markdown formatting.
5. Use bullet points for lists and keep the output professional.

Put the resume and cover letter back to back in the same code

Here is the user's input:
`;

export const sampleUserPrompt = `{
  "user": {
    "userID": "1",
    "firstName": "Jaskirat",
    "lastName": "Singh",
    "email": "jsingh9@ualberta.ca",
    "phone": "+1(587) 966-1339"
  },
  "workExperiences": [
    {
      "workExperienceID": "1",
      "companyName": "Redlen Technologies (Canon Inc.)",
      "jobTitle": "R&D Process Development Engineer",
      "startDate": "2022-08-01",
      "endDate": "2024-05-01",
      "description": "Optimized semiconductor manufacturing processes for X-ray sensors reducing sensor lag by 5%. Automated data collection with Python scripts, saving 30 hours a week. Transitioned R&D from Excel to Power Apps and VBA, enhancing automation. Designed and tested solutions for medical semiconductor industry requirements."
    },
    {
      "workExperienceID": "2",
      "companyName": "Elko Engineering Garage",
      "jobTitle": "Software Engineer Intern",
      "startDate": "2022-04-01",
      "endDate": "2022-08-01",
      "description": "Developed custom educational software scripts for engineering tools. Conducted training sessions and troubleshooting, ensuring machine uptime. Collaborated on software problem solving and weekly code reviews."
    }
  ],
  "educations": [
    {
      "educationID": "1",
      "institutionName": "University of Calgary",
      "degree": "M.Eng. Software Engineering",
      "startYear": "2024",
      "endYear": null
    },
    {
      "educationID": "2",
      "institutionName": "University of Alberta",
      "degree": "B.Sc. Electrical Nano-Engineering",
      "startYear": "2018",
      "endYear": "2022"
    }
  ],
  "jobDescription": {
    "jobDescription": "Seeking a challenging software engineering position leveraging my skills in Python, C++, firmware development, and semiconductor processes."
  },
  "settings": {
    "resumePageLength": 2,
    "includeCoverLetter": true,
    "includePersonalSummary": true,
    "generateSkills": true,
    "highlightSkillsSection": true
  },
  "customizationPrompt": {
    "customizationPrompt": "Customize the resume for a software engineering role focused on innovation, leadership, and technical problem solving."
  },
  "devSettings": {
    "rawText": true
  }
}`;
