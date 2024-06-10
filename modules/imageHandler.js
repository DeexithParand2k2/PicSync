const uploadToDrive = require('./uploadToDrive')
const msgHandler = require('./msgHandler')
const bot = require('./bot')
const path = require('path')
const axios = require('axios')
const fs = require("fs");
const handleMultipleRequestsError = require('./handleMultipleRequestsError')

var fileUploadStatus = require('./state')

function callWhenQueueIsComplete(){

    // if queue is empty and completedFromQueue is not empty
    if (fileUploadStatus.queued.length === fileUploadStatus.completedFromQueue.length) {

        fileUploadStatus.completedFromQueue.forEach((e) => {
            fileUploadStatus.completed.push(e)
        })

        fileUploadStatus.lastUploadedCount = fileUploadStatus.completedFromQueue.length
        
        fileUploadStatus.completedFromQueue = []
        fileUploadStatus.queued = []
    }
    
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

        try {

            writer.on('finish', async () => {
                // Upload the file to Google Drive
                await uploadToDrive(googleDriveAPI, filePath, path.basename(filePath), googleDriveFolderId);
                
                fileUploadStatus.completedFromQueue.push(file.file_path)

                callWhenQueueIsComplete() // empty queue, fill completed

                // Clean up the local file
                fs.unlinkSync(filePath);
            });

            writer.on('error', (error) => {
                console.error('Error saving the file:', error);
                fileUploadStatus.failed.push(file.file_path)
            });

        } catch(err){
            console.log('Handle Writer Error Seperately')
        }


    } catch(err){
        bot.sendMessage(msg.chat.id, `Multi error`);
        await handleMultipleRequestsError(err, msg);
    }
    

}

module.exports = imageHandler