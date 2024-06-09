const moment = require('moment-timezone');
const fs = require("fs");

// Function to upload file to Google Drive
async function uploadToDrive(drive, filePath, fileName, folderIdPromise) {

    // Correct time format
    const currentTime = moment().tz('Europe/London').format('HH:mm:ss');
    const currentDay = moment().tz('Europe/London').format('dddd');
    const fullFileName = `${currentDay}_${currentTime}_${fileName}`;

    // Resolved the uploading to root error
    let folderId;
    try {
        folderId = await folderIdPromise;
    } catch (error) {
        console.error('Error resolving folderId promise:', error);
        throw error;
    }

    console.log(folderId)

    // Define file metadata
    const fileMetadata = {
        'name': fullFileName,
        'parents': [folderId] // Correct format for parents
    };

    console.log(fileMetadata)
    // Define media content
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath)
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id' // Request only the file ID in the response
        });

        console.log('Uploaded file ID:', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error uploading to Google Drive:', error.message);
        throw error;
    }
}

module.exports = uploadToDrive