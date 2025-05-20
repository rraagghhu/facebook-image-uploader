const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const config = require('../config/defaults')

const logger = winston.createLogger({
  level: config.get('logLevel'),
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),
    new DailyRotateFile({
      filename: config.get('logFile'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: config.get('maxLogFiles'),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  ]
})

module.exports = logger
