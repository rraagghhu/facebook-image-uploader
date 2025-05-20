#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const AdmZip = require('adm-zip')
const {program} = require('commander')
const axios = require('axios')

// Import our new utilities
const config = require('./src/config/defaults')
const logger = require('./src/utils/logger')
const ProgressTracker = require('./src/utils/progress')
const ImageValidator = require('./src/validators/imageValidator')
const Security = require('./src/utils/security')
const Reporter = require('./src/reporters/reporter')

// Facebook API utility function
async function makeFacebookCall({method, endpoint, formData}) {
  try {
    const response = await axios({
      method,
      url: `https://graph.facebook.com/${config.get('apiVersion')}${endpoint}`,
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${await Security.loadToken()}`,
        'Accept': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    logger.error('Facebook API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data
    })
    throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`)
  }
}

// Simple concurrency control
async function processWithConcurrency(items, processFn, concurrency) {
  const results = []
  const chunks = []

  // Split items into chunks based on concurrency
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency))
  }

  // Process each chunk
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processFn))
    results.push(...chunkResults)
  }

  return results
}

async function processImages(accountId, zipFilePath, outputCsvPath) {
  const progress = new ProgressTracker(0)
  const results = []
  const failedImages = []

  try {
    // Read and extract zip file
    const zip = new AdmZip(zipFilePath)
    const zipEntries = zip.getEntries()

    // Filter for image files
    const imageEntries = zipEntries.filter(entry => {
      if (entry.entryName.startsWith('__MACOSX/') || entry.entryName.includes('/._')) {
        return false
      }
      const ext = path.extname(entry.entryName).toLowerCase().slice(1)
      return config.get('supportedFormats').includes(ext)
    })

    progress.total = imageEntries.length
    progress.update('Starting image processing', 0)

    // Process images with concurrency limit
    const uploadResults = await processWithConcurrency(
      imageEntries,
      async entry => {
        const result = await processImage(entry, accountId, progress)
        progress.update(`Processed ${path.basename(entry.entryName)}`, 1)
        return result
      },
      config.get('concurrentUploads')
    )

    // Process results
    uploadResults.forEach((result, index) => {
      if (result.status === 'success') {
        results.push(result)
      } else {
        const entry = imageEntries[index]
        failedImages.push(entry.entryName)
        results.push({
          image_name: path.basename(entry.entryName),
          status: 'error',
          error: result.error || 'Unknown error'
        })
      }
    })

    // Generate report
    const reportFormat = path.extname(outputCsvPath).slice(1) || 'csv'
    const reportContent = await Reporter.generateReport(results, reportFormat)
    await Reporter.saveReport(reportContent, reportFormat, outputCsvPath)

    // Show summary
    progress.success(`Processing complete. Results written to ${outputCsvPath}`)
    logger.info(
      `Successfully processed ${results.filter(r => r.status === 'success').length} out of ${
        imageEntries.length
      } images.`
    )

    if (failedImages.length > 0) {
      progress.info('\nFailed images:')
      failedImages.forEach(image => logger.warn(`- ${image}`))
    }
  } catch (error) {
    progress.error('Error processing images')
    logger.error('Error:', error)
    process.exit(1)
  } finally {
    progress.stop()
  }
}

async function processImage(entry, accountId, progress) {
  const imageBuffer = entry.getData()
  const imageName = path.basename(entry.entryName)

  try {
    // Validate image
    const validation = await ImageValidator.validateImage(imageBuffer, imageName)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // Optimize image if needed
    const optimizedBuffer = await ImageValidator.optimizeImage(imageBuffer, validation.metadata)

    // Create form data for upload
    const formData = new FormData()
    formData.append('file', optimizedBuffer, {
      filename: imageName,
      contentType: `image/${validation.metadata.format}`
    })

    // Upload image to Facebook
    const uploadResponse = await makeFacebookCall({
      method: 'POST',
      endpoint: `/act_${accountId}/adimages`,
      formData
    })

    if (uploadResponse && uploadResponse.images) {
      const imageData = uploadResponse.images
      const imageHash = Object.values(imageData)[0].hash

      return {
        image_name: imageName,
        image_hash: imageHash,
        status: 'success'
      }
    }

    throw new Error('Unexpected response from Facebook API')
  } catch (error) {
    return {
      image_name: imageName,
      status: 'error',
      error: error.message
    }
  }
}

// Set up command line interface
program
  .version('1.0.0')
  .description('Upload images to Facebook Ads and generate CSV with image hashes')
  .requiredOption('-a, --account <id>', 'Facebook Ad Account ID')
  .requiredOption('-i, --input <file>', 'Input ZIP file containing images')
  .requiredOption('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (csv, json, excel, html)', 'csv')
  .option('-c, --concurrent <number>', 'Number of concurrent uploads', parseInt)
  .parse(process.argv)

const options = program.opts()

// Update config with command line options
if (options.concurrent) {
  config.set('concurrentUploads', options.concurrent)
}

// Run the main function
processImages(options.account, options.input, options.output)
