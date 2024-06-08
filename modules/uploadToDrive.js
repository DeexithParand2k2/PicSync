const moment = require('moment-timezone');
const fs = require("fs");

// Function to upload file to Google Drive
async function uploadToDrive(drive, filePath, fileName) {

    const currentTime = moment().tz("Europe/London").format("HH:MM:SS");
    const currentDay = moment().tz("Europe/London").format("dddd")
    try {
        const response = await drive.files.create({
            requestBody: {
                name: currentDay + "_" + currentTime + "_" + fileName,
                mimeType: 'image/jpeg', // Assuming jpg/jpeg images
            },
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(filePath),
            },
        });

        console.log('Uploaded file:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading to Google Drive:', error.message);
        throw error;
    }
}

module.exports = uploadToDrive