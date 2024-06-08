require('dotenv').config();
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const { google } = require('googleapis')
const axios = require('axios');
// const moment = require('moment-timezone');

// user defined modules
const createBuffer = require('./modules/createBuffer')
const getUserId = require('./modules/getUserId')
const uploadToDrive = require('./modules/uploadToDrive')

// Load environment variables
const BOT_TOKEN = process.env.BOT_KEY;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'

// Initialize the bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Server Started ... ")

// creating a local buffer
createBuffer()

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialize Google Drive API
const googleDriveAPI = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

// handle if image is sent
async function imageHandler(msg, userUid) {
    const replyMessage = "Telegram User : " + userUid + "\nYou sent an image."

    const photo = msg.photo[msg.photo.length - 1];

    // Get file information from Telegram
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    // Update the filePath to use ./buffer directory
    const filePath = path.join(__dirname, 'buffer', path.basename(file.file_path));

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
            const uploadedFile = await uploadToDrive(googleDriveAPI, filePath, path.basename(filePath));
            bot.sendMessage(msg.chat.id, `${replyMessage}\nFile uploaded to Google Drive: ${uploadedFile.id}`);

            // Clean up the local file
            fs.unlinkSync(filePath);
        } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to upload the image to Google Drive.',error);
        }
    });

    writer.on('error', (error) => {
        console.error('Error saving the file:', error);
        bot.sendMessage(msg.chat.id, 'Failed to save the image.');
    });

    bot.sendMessage(msg.chat.id, replyMessage);
}

// Function to handle errors while uploading multiple images
async function handleError(err, msg) {
    if (err.response && err.response.statusCode === 429) {
        const retryAfter = err.response.headers['retry-after'] || 5;
        console.log(`Too Many Requests: Retrying after ${retryAfter} seconds`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        bot.emit('message', msg); // Re-emit the message after waiting
    } else {
        console.error('Unhandled error:', err);
        bot.sendMessage(msg.chat.id, 'An error occurred. Please try again later.');
    }
}


bot.on('message', async (msg) => {

    // get userId of sender
    const userUid = getUserId(msg)

    try {
        // Check if the message contains a photo
        if (msg.photo) {
            await imageHandler(msg, userUid)
        } else if (msg.text) {
            // Respond if a text message is sent
            msgHandler(msg, userUid)
        } else {
            // Handle other types of messages if necessary
            bot.sendMessage(msg.chat.id, 'You sent a different type of message.');
        }

        // Wait for 2 seconds after each request
        // await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
        await handleError(err, msg);
    }

    bot.sendMessage(msg.chat.id, 'Completed Upload ');

});


function msgHandler(msg, userUid) {
    const replyMessage = "Telegram User : " + userUid + "\nMsg : " + msg.text.toString()
    bot.sendMessage(msg.chat.id, replyMessage);
}