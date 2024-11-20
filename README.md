# Hire-Wire

This tool that generates resumes and cover letters tailored for specific job postings.
The target audience is anyone who is preparing job applications.
Users will be able to register and log in with a username and password,
and create a profile that includes personal information, employment experience, and education experience.

# Developer Requirements

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MySQL
- **AI Integration**: OpenAI GPT API

## System Requirements
- **Operating System**:
    - Windows 10 or later / macOS 11 (Big Sur) or later / Ubuntu 20.04 or later
- **Network**:
    - Stable internet connection for dependency installation and API calls.

## Environment Requirements

### NodeJS
- Compatible with Node.js **v18.0.0 or later**.
- [Download Node.js](https://nodejs.org/).
### React
- React **v18.3.1 or later**.
### npm
- npm **v8.0.0 or later**.
### MySQL
- MySQL **v8.0 or later**.

## Environment Variables

### Frontend `.env`

Create a `.env` file in the root of your frontend directory and include the following:
```env
# Sample .env for frontend
REACT_APP_BASE_URL=http://localhost:8000/api/v1/
```

### Backend `.env`

Create a `.env` file in the root of your backend directory and include the following:
```env
# Sample .env for backend

# Database Configuration
MYSQLUSERNAME=
MYSQLPASSWORD=
MYSQLDATABASE=
MYSQLHOST=
MYSQLPORT=

# Test Database Configuration
DB_NAME_TEST=
DB_USER_TEST=
DB_PASSWORD_TEST=
DB_HOST_TEST=
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# OpenAI API Key
OPENAI_API_KEY=your_api_key

# Node Environment
NODE_ENV=test
```

# Setup
1. Verify that your development environment meets application requirements.
2. Verify that your frontend and backend `.env` match the samples provided, and contain valid details specific to your development environment.
3. Create a database in MySQL with a name matching the `MYSQLDATABASE` in the `.env` file.
4. Ensure MySQL is running and accessible on `MYSQLHOST` and `MYSQLPORT` as specified in `.env`.
5. Execute `npm install` in the terminal of your frontend and backend to install required dependencies.
6. If running tests, ensure that `NODE_ENV=test` in your backend environment. Otherwise, remove this for development.
7. Run migration scripts by executing `npx sequelize-cli db:seed:undo:all --config src/config/config-wrapper.cjs` in your backend terminal.
8. Verify that migration scripts successfully initialize your database in MySQL.
9. Execute `npm start` in the terminal of frontend and backend environment to start the application.

## Available Scripts

### `npm install`
Installs package dependencies, which are specified by in the `package.json`.

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Executes the test suite.
