// logger.js

import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, errors } = format;

// Custom log format
const myFormat = printf(({ level, message, stack }) =>
  `${timestamp} [${level}] : ${stack || message}`);

// Create the logger instance
const logger = createLogger({
  level: 'info', // Minimum level to log
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Capture stack trace
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

export default logger;
