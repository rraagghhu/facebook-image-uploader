# Facebook Image Uploader

A Node.js tool to upload images to Facebook Ads and generate reports with image hashes.

## Features

- Upload multiple images to Facebook Ads from a ZIP file
- Generate reports in multiple formats (CSV, JSON, Excel, HTML)
- Progress tracking and detailed logging
- Image validation and optimization
- Secure token storage
- Concurrent uploads with configurable limits

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- A Facebook Ad Account ID
- A Facebook Access Token

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rraagghhu/facebook-image-uploader.git
   cd facebook-image-uploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create an `accesstoken.json` file in the project root:
   ```json
   {
     "access_token": "YOUR_FACEBOOK_ACCESS_TOKEN"
   }
   ```

## Usage

### Basic Usage

```bash
node upload.js -a <AD_ACCOUNT_ID> -i <ZIP_FILE> -o <OUTPUT_FILE>
```

Example:
```bash
node upload.js -a 123456789 -i images.zip -o results
```

### Command Line Options

- `-a, --account <id>`: Facebook Ad Account ID (required)
- `-i, --input <file>`: Input ZIP file containing images (required)
- `-o, --output <file>`: Output file path (required)
- `-f, --format <format>`: Output format (csv, json, excel, html) [default: "csv"]
- `-c, --concurrent <number>`: Number of concurrent uploads [default: 3]

### Output Formats

The tool supports multiple output formats:
- CSV (default)
- JSON
- Excel
- HTML

Example with format:
```bash
node upload.js -a 123456789 -i images.zip -o results -f json
```

### Concurrent Uploads

Control the number of concurrent uploads:
```bash
node upload.js -a 123456789 -i images.zip -o results -c 5
```

## Image Requirements

- Supported formats: PNG, JPG, JPEG, GIF, WEBP
- Maximum dimensions: 1936x1936 pixels
- Maximum file size: 30MB

## Logging

Logs are stored in the `logs` directory with daily rotation. Check `logs/upload.log` for detailed information about the upload process.

## Security

The tool includes several security features:
- Encrypted token storage
- Secure configuration management
- Input validation
- Error handling and logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

