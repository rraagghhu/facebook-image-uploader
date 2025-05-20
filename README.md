# Facebook Image Uploader

A command-line tool to upload images to Facebook Ads and generate a CSV file with image hashes.

## Prerequisites

- Node.js (v14 or higher)
- Facebook Access Token with ads_management permission

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Configuration

1. Copy the example access token file:
```bash
cp accesstoken.example.json accesstoken.json
```

2. Edit `accesstoken.json` and replace `your_facebook_access_token_here` with your actual Facebook access token.

Make sure your access token has the `ads_management` permission.

## Usage

Run the script with the following command:
```bash
node upload.js -a <account_id> -i <zip_file_name> -o <csv_file_name>
```

### Parameters

- `-a, --account`: Facebook Ad Account ID (required)
- `-i, --input`: Input ZIP file containing images (required)
- `-o, --output`: Output CSV file path (required)

### Example

```bash
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

