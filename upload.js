#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const {Parser: Json2csvParser} = require('json2csv')
const AdmZip = require('adm-zip')
const {program} = require('commander')
const axios = require('axios')

// Read access token from JSON file
let accessToken
try {
  const tokenData = JSON.parse(fs.readFileSync('accesstoken.json', 'utf8'))
  accessToken = tokenData.access_token
} catch (error) {
  console.error('Error reading access token:', error.message)
  process.exit(1)
}

// Facebook API utility function
async function makeFacebookCall({method, endpoint, formData}) {
  try {
    const response = await axios({
      method,
      url: `https://graph.facebook.com/v22.0${endpoint}`,
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Facebook API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data
    })
    throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`)
  }
}

async function processImages(accountId, zipFilePath, outputCsvPath) {
  try {
    // Read and extract zip file
    const zip = new AdmZip(zipFilePath)
    const zipEntries = zip.getEntries()

    // Filter for image files
    const allowedImageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']
    const imageEntries = zipEntries.filter(entry => {
      // Skip macOS system files and __MACOSX directory
      if (entry.entryName.startsWith('__MACOSX/') || entry.entryName.includes('/._')) {
        return false
      }
      const ext = path.extname(entry.entryName).toLowerCase().slice(1)
      return allowedImageExtensions.includes(ext)
    })

    const results = []
    const failedImages = []

    // Process each image
    for (const entry of imageEntries) {
      console.log(`Processing: ${entry.entryName}`)
      const imageBuffer = entry.getData()
      const imageName = path.basename(entry.entryName)

      // Map file extensions to proper MIME types
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      }
      const ext = path.extname(imageName).toLowerCase().slice(1)
      const contentType = mimeTypes[ext]

      try {
        // Create form data for upload
        const formData = new FormData()

        // Debug image data
        console.log(`Image details for ${imageName}:`)
        console.log(`- Size: ${imageBuffer.length} bytes`)
        console.log(`- Content Type: ${contentType}`)
        console.log(`- Extension: ${ext}`)

        // Append the image buffer directly
        formData.append('file', imageBuffer, {
          filename: imageName,
          contentType: contentType
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

          results.push({
            image_name: imageName,
            image_hash: imageHash
          })

          console.log(`Successfully processed: ${imageName} (Hash: ${imageHash})`)
        } else {
          console.error(`Unexpected response for ${imageName}:`, uploadResponse)
          failedImages.push(imageName)
        }
      } catch (error) {
        console.error(`Error processing ${imageName}:`, error.message)
        failedImages.push(imageName)
      }
    }

    // Write results to CSV
    const fields = ['image_name', 'image_hash']
    const json2csvParser = new Json2csvParser({fields})
    const csv = json2csvParser.parse(results)
    fs.writeFileSync(outputCsvPath, csv)

    console.log(`\nProcessing complete. Results written to ${outputCsvPath}`)
    console.log(`Successfully processed ${results.length} out of ${imageEntries.length} images.`)
    if (failedImages.length > 0) {
      console.log('\nFailed images:')
      failedImages.forEach(image => console.log(`- ${image}`))
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Set up command line interface
program
  .version('1.0.0')
  .description('Upload images to Facebook Ads and generate CSV with image hashes')
  .requiredOption('-a, --account <id>', 'Facebook Ad Account ID')
  .requiredOption('-i, --input <file>', 'Input ZIP file containing images')
  .requiredOption('-o, --output <file>', 'Output CSV file path')
  .parse(process.argv)

const options = program.opts()

// Run the main function
processImages(options.account, options.input, options.output)
