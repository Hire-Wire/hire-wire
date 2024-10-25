# Hire-wire

**Hire-wire** is a web application designed to help job seekers generate personalized resumes and cover letters tailored to specific job postings using an LLM (Large Language Model). This project uses React for the frontend, Node.js with Express for the backend, and MySQL for data storage, hosted on Google Cloud.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and login with secure password management.
- User profile management (personal information, education, and work experience).
- Job posting input for tailored resume and cover letter generation.
- Integration with OpenAI's GPT model for generating resumes and cover letters.
- Downloadable resume and cover letter in PDF format.
- User-friendly interface with mobile and desktop support.
- Google Cloud-hosted backend and database.

### Frontend:
- **React**: For building the user interface.
- **Axios**: For making HTTP requests to the backend API.
- **React Router**: For navigation between different pages.
- **Figma**: Used for prototyping and design.

### Backend:
- **Node.js**: For server-side JavaScript execution.
- **Express**: For handling API requests.
- **OpenAI GPT**: LLM used to generate resumes and cover letters.
- **MySQL**: For storing user profiles and job postings.
- **Google Cloud SQL**: For hosting the database.
- **JSON Web Tokens (JWT)**: For user authentication.

### Tools:
- **GitHub Actions**: For continuous integration and deployment (CI/CD).
- **Swagger**: For documenting and testing the backend API.
- **Prettier/ESLint**: For code formatting and linting.

## Installation

### Prerequisites:
Make sure you have the following installed on your machine:
- **Node.js** (v14 or higher)
- **MySQL** (local or hosted)
- **Git** (for version control)

**How can this be tested?**

   1. Clone this repository:
     ```bash```
     git clone https://github.com/your-username/hire-wire.git
  2. Navigate to the project directory 
      ```cd hire-wire```
  3. Install dependencies
      ```npm install```
  4. run ```npm start```
  5. Go to your web browser and enter ```http://localhost:8000/```

**Highlight how this PR can be tested**
-  run ```npm test```
