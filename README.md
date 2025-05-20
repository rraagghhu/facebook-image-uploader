# Facebook Image Uploader

A command-line tool to upload images to Facebook Ads and generate a CSV file with image hashes.

## Prerequisites

- For development: Node.js (v14 or higher)
- For end users: No prerequisites needed, just download the executable for your platform

## Installation

### For Developers

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

### For End Users

1. Download the appropriate executable for your platform from the [Releases](https://github.com/rraagghhu/facebook-image-uploader/releases) page:
   - Windows: `facebook-image-uploader-win.exe`
   - macOS: `facebook-image-uploader-macos`
   - Linux: `facebook-image-uploader-linux`

2. Make the executable file executable (macOS/Linux only):
```bash
chmod +x facebook-image-uploader-macos  # for macOS
chmod +x facebook-image-uploader-linux  # for Linux
```

## Configuration

1. Copy the example access token file:
```bash
cp accesstoken.example.json accesstoken.json
```

2. Edit `accesstoken.json` and replace `your_facebook_access_token_here` with your actual Facebook access token.

Make sure your access token has the `ads_management` permission.

## Usage

### Using the Executable

Run the executable with the following command:

```bash
# Windows
facebook-image-uploader-win.exe -a <account_id> -i <zip_file_name> -o <csv_file_name>

# macOS
./facebook-image-uploader-macos -a <account_id> -i <zip_file_name> -o <csv_file_name>

# Linux
./facebook-image-uploader-linux -a <account_id> -i <zip_file_name> -o <csv_file_name>
```

### Using Node.js (for developers)

```bash
node upload.js -a <account_id> -i <zip_file_name> -o <csv_file_name>
```

### Parameters

- `-a, --account`: Facebook Ad Account ID (required)
- `-i, --input`: Input ZIP file containing images (required)
- `-o, --output`: Output CSV file path (required)

### Example

```bash
# Using executable
./facebook-image-uploader-macos -a 3474663215890474 -i images.zip -o results.csv

# Using Node.js
node upload.js -a 3474663215890474 -i images.zip -o results.csv
```

## Output

The script will:
1. Process all images in the ZIP file
2. Upload them to Facebook Ads
3. Generate a CSV file with two columns:
   - `image_name`: Original name of the image
   - `image_hash`: Facebook's image hash

## Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- WebP

## Error Handling

The script will:
- Exit with an error if it cannot read or parse the `accesstoken.json` file
- Log any errors encountered during image processing
- Continue processing remaining images if one image fails
- Show a summary of successful and failed uploads at the end

## Security Note

Never commit your `accesstoken.json` file to version control. The file is already included in `.gitignore` to prevent accidental commits.

## Building from Source

If you want to build the executables yourself:

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Build the executables:
```bash
npm run build
```

The executables will be created in the `dist` directory.

