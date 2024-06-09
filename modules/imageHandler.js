const uploadToDrive = require('./uploadToDrive')
const msgHandler = require('./msgHandler')
const bot = require('./bot')
const path = require('path')
const axios = require('axios')
const fs = require("fs");

// handle if image is sent
async function imageHandler(msg, userUid, googleDriveFolderId, googleDriveAPI) {

    const photo = msg.photo[msg.photo.length - 1];

    const BOT_TOKEN = process.env.BOT_KEY;

    // Get file information from Telegram
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    // Update the filePath to use ./buffer directory
    const filePath = path.join(__dirname, '..', 'buffer', path.basename(file.file_path));

    // Download the file
    const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
    });

    // Save the file locally
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
        try {
            // Upload the file to Google Drive
            await uploadToDrive(googleDriveAPI, filePath, path.basename(filePath), googleDriveFolderId);
            msgHandler(msg,`${userUid}'s ${file.file_path} uploaded to Google Drive`)

            // Clean up the local file
            fs.unlinkSync(filePath);
        } catch (error) {
            bot.sendMessage(msg.chat.id, `Failed to upload the image to Google Drive ${error}`);
        }
    });

    writer.on('error', (error) => {
        console.error('Error saving the file:', error);
        bot.sendMessage(msg.chat.id, 'Failed to save the image.');
    });

}

module.exports = imageHandler