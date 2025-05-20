const sharp = require('sharp')
const config = require('../config/defaults')
const logger = require('../utils/logger')

class ImageValidator {
  static async validateImage(imageBuffer, filename) {
    try {
      const metadata = await sharp(imageBuffer).metadata()
      const errors = []

      // Check format
      if (!config.get('supportedFormats').includes(metadata.format)) {
        errors.push(`Unsupported format: ${metadata.format}`)
      }

      // Check dimensions
      if (metadata.width > config.get('maxImageWidth')) {
        errors.push(
          `Image width (${metadata.width}px) exceeds maximum allowed (${config.get(
            'maxImageWidth'
          )}px)`
        )
      }
      if (metadata.height > config.get('maxImageHeight')) {
        errors.push(
          `Image height (${metadata.height}px) exceeds maximum allowed (${config.get(
            'maxImageHeight'
          )}px)`
        )
      }

      // Check file size
      if (imageBuffer.length > config.get('maxImageSize')) {
        errors.push(
          `File size (${(imageBuffer.length / 1024 / 1024).toFixed(
            2
          )}MB) exceeds maximum allowed (${config.get('maxImageSize') / 1024 / 1024}MB)`
        )
      }

      if (errors.length > 0) {
        logger.warn(`Image validation failed for ${filename}:`, {errors})
        return {
          isValid: false,
          errors,
          metadata
        }
      }

      return {
        isValid: true,
        metadata
      }
    } catch (error) {
      logger.error(`Error validating image ${filename}:`, error)
      return {
        isValid: false,
        errors: [`Error processing image: ${error.message}`]
      }
    }
  }

  static async optimizeImage(imageBuffer, metadata) {
    try {
      let optimizedBuffer = imageBuffer

      // Resize if needed
      if (
        metadata.width > config.get('maxImageWidth') ||
        metadata.height > config.get('maxImageHeight')
      ) {
        optimizedBuffer = await sharp(imageBuffer)
          .resize(config.get('maxImageWidth'), config.get('maxImageHeight'), {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer()
      }

      // Compress if needed
      if (optimizedBuffer.length > config.get('maxImageSize')) {
        optimizedBuffer = await sharp(optimizedBuffer).jpeg({quality: 80}).toBuffer()
      }

      return optimizedBuffer
    } catch (error) {
      logger.error('Error optimizing image:', error)
      throw error
    }
  }
}

module.exports = ImageValidator
