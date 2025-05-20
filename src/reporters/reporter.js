const fs = require('fs').promises
const path = require('path')
const {Parser: Json2csvParser} = require('json2csv')
const ExcelJS = require('exceljs')
const htmlPdf = require('html-pdf-node')
const config = require('../config/defaults')
const logger = require('../utils/logger')

class Reporter {
  static async generateReport(results, format = config.get('defaultReportFormat')) {
    try {
      switch (format.toLowerCase()) {
        case 'csv':
          return await this.generateCsv(results)
        case 'json':
          return await this.generateJson(results)
        case 'excel':
          return await this.generateExcel(results)
        case 'html':
          return await this.generateHtml(results)
        default:
          throw new Error(`Unsupported report format: ${format}`)
      }
    } catch (error) {
      logger.error('Error generating report:', error)
      throw error
    }
  }

  static async generateCsv(results) {
    const fields = ['image_name', 'image_hash', 'status', 'error']
    const parser = new Json2csvParser({fields})
    return parser.parse(results)
  }

  static async generateJson(results) {
    return JSON.stringify(results, null, 2)
  }

  static async generateExcel(results) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Upload Results')

    worksheet.columns = [
      {header: 'Image Name', key: 'image_name', width: 30},
      {header: 'Image Hash', key: 'image_hash', width: 40},
      {header: 'Status', key: 'status', width: 15},
      {header: 'Error', key: 'error', width: 50}
    ]

    results.forEach(result => {
      worksheet.addRow(result)
    })

    return workbook
  }

  static async generateHtml(results) {
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Image Upload Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>Facebook Image Upload Report</h1>
          <table>
            <tr>
              <th>Image Name</th>
              <th>Image Hash</th>
              <th>Status</th>
              <th>Error</th>
            </tr>
            ${results
              .map(
                result => `
              <tr>
                <td>${result.image_name}</td>
                <td>${result.image_hash || ''}</td>
                <td class="${result.status === 'success' ? 'success' : 'error'}">${
                  result.status
                }</td>
                <td>${result.error || ''}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </body>
      </html>
    `

    return template
  }

  static async saveReport(content, format, outputPath) {
    try {
      const extension = format.toLowerCase()
      const filePath = `${outputPath}.${extension}`

      if (format === 'excel') {
        await content.xlsx.writeFile(filePath)
      } else {
        await fs.writeFile(filePath, content)
      }

      logger.info(`Report saved to ${filePath}`)
      return filePath
    } catch (error) {
      logger.error('Error saving report:', error)
      throw error
    }
  }
}

module.exports = Reporter
