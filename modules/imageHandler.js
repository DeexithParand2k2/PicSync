const uploadToDrive = require('./uploadToDrive')
const msgHandler = require('./msgHandler')
const bot = require('./bot')
const path = require('path')
const axios = require('axios')
const fs = require("fs");
const handleMultipleRequestsError = require('./handleMultipleRequestsError')

var fileUploadStatus = require('./state')

function callWhenQueueIsEmpty(){
    console.log('before status : ',fileUploadStatus)
    // if queue is empty and completedFromQueue is not empty
    if (fileUploadStatus.queued.length === 0 && fileUploadStatus.completedFromQueue.length > 0) {

        fileUploadStatus.completedFromQueue.forEach((e) => {
            fileUploadStatus.completed.push(e)
        })

        fileUploadStatus.completedFromQueue = []
    }
    console.log('after status : ',fileUploadStatus)
}

// handle if image is sent
async function imageHandler(msg, userUid, googleDriveFolderId, googleDriveAPI) {

    const photo = msg.photo[msg.photo.length - 1];
    const BOT_TOKEN = process.env.BOT_KEY;

    try {
        // Get file information from Telegram
        const file = await bot.getFile(photo.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;


        // newly to be uploaded image
        fileUploadStatus.queued.push(file.file_path) // queued the file name from telegram

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
                
                fileUploadStatus.completedFromQueue.push(file.file_path)
                
                // remove from queue
                fileUploadStatus.queued.shift()

                callWhenQueueIsEmpty() // empty queue, fill completed
                
                // msgHandler(msg, `${userUid}'s ${file.file_path} uploaded to Google Drive`)

                // Clean up the local file
                fs.unlinkSync(filePath);
            } catch (error) {
                fileUploadStatus.failed.push(file.file_path)
                bot.sendMessage(msg.chat.id, `Failed to upload the image to Google Drive ${error}`);
            }
        });

        writer.on('error', (error) => {
            console.error('Error saving the file:', error);
            fileUploadStatus.failed.push(file.file_path)
            bot.sendMessage(msg.chat.id, 'Failed to save the image.');
        });
    } catch(err){
        await handleMultipleRequestsError(err, msg);
    }
    

}

module.exports = imageHandler