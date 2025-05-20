const fs = require('fs')
const path = require('path')

const defaultConfig = {
  // Facebook API settings
  apiVersion: 'v22.0',
  maxRetries: 3,
  retryDelay: 1000,
  concurrentUploads: 3,

  // Image settings
  maxImageSize: 30 * 1024 * 1024, // 30MB
  maxImageWidth: 1936,
  maxImageHeight: 1936,
  supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],

  // Logging settings
  logLevel: 'info',
  logFile: 'logs/upload.log',
  maxLogFiles: 5,

  // Report settings
  reportFormats: ['csv', 'json', 'excel', 'html'],
  defaultReportFormat: 'csv',

  // Security settings
  encryptToken: true,
  tokenRefreshInterval: 24 * 60 * 60 * 1000 // 24 hours
}

class Config {
  constructor() {
    this.config = {...defaultConfig}
    this.configPath = path.join(process.cwd(), 'config.json')
    this.loadConfig()
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const savedConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
        this.config = {...this.config, ...savedConfig}
      }
    } catch (error) {
      console.warn('Error loading config file:', error.message)
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.warn('Error saving config file:', error.message)
    }
  }

  get(key) {
    return this.config[key]
  }

  set(key, value) {
    this.config[key] = value
    this.saveConfig()
  }
}

module.exports = new Config()
