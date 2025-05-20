const CryptoJS = require('crypto-js')
const fs = require('fs')
const path = require('path')
const config = require('../config/defaults')
const logger = require('./logger')

class Security {
  static getEncryptionKey() {
    // In a production environment, this should be stored securely
    // For now, we'll use a combination of machine-specific information
    const machineId = require('os').hostname()
    return CryptoJS.SHA256(machineId).toString()
  }

  static encryptToken(token) {
    try {
      const key = this.getEncryptionKey()
      return CryptoJS.AES.encrypt(token, key).toString()
    } catch (error) {
      logger.error('Error encrypting token:', error)
      throw error
    }
  }

  static decryptToken(encryptedToken) {
    try {
      const key = this.getEncryptionKey()
      const bytes = CryptoJS.AES.decrypt(encryptedToken, key)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      logger.error('Error decrypting token:', error)
      throw error
    }
  }

  static async saveToken(token) {
    try {
      const encryptedToken = this.encryptToken(token)
      const tokenData = {
        access_token: encryptedToken,
        encrypted: true,
        timestamp: Date.now()
      }

      await fs.promises.writeFile('accesstoken.json', JSON.stringify(tokenData, null, 2))

      logger.info('Token saved successfully')
    } catch (error) {
      logger.error('Error saving token:', error)
      throw error
    }
  }

  static async loadToken() {
    try {
      const tokenData = JSON.parse(await fs.promises.readFile('accesstoken.json', 'utf8'))

      if (tokenData.encrypted) {
        return this.decryptToken(tokenData.access_token)
      }

      return tokenData.access_token
    } catch (error) {
      logger.error('Error loading token:', error)
      throw error
    }
  }

  static isTokenExpired(timestamp) {
    const now = Date.now()
    const tokenAge = now - timestamp
    return tokenAge > config.get('tokenRefreshInterval')
  }
}

module.exports = Security
