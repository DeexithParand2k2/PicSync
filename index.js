require('dotenv').config();
const { google } = require('googleapis')

// variable data
var fileUploadStatus = require('./modules/state')

// user defined modules
const createBuffer = require('./modules/createBuffer')
const getUserId = require('./modules/getUserId')
const authorizeImageHandler = require('./modules/authorizeImageHandler')
const createDriveFolder = require('./modules/createDriveFolder')
const imageHandler = require('./modules/imageHandler')
const msgHandler = require('./modules/msgHandler')
const handleMultipleRequestsError = require('./modules/handleMultipleRequestsError')
const bot = require('./modules/bot')
const printCurrentStatus = require('./modules/printCurrentStatus')

// Load environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const GOOGLE_DRIVE_FOLDER_NAME = process.env.GOOGLE_DRIVE_FOLDER_NAME;

// Creating a local buffer Folder
createBuffer()
console.log("Created Buffer Folder ... ")

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

// Created a Folder for drive upload
const googleDriveFolderId = createDriveFolder(googleDriveAPI,GOOGLE_DRIVE_FOLDER_NAME)
console.log("Goolgle Drive Storage Folder Created ... ")

// API Setup Complete
var chatInstance = ''

function clearStatus(){
    fileUploadStatus.queued = []
    fileUploadStatus.completed = []
    fileUploadStatus.failed = []
    fileUploadStatus.lastUploadedCount = 0
}

bot.on('message', async (msg) => {

    // get userId of sender
    const userUid = getUserId(msg)
    const authorizedUserUid = authorizeImageHandler(userUid)
    chatInstance = msg

    try {
        // Check if the message contains a photo
        if (msg.photo) {

            if(authorizedUserUid===true){
                await imageHandler(msg, userUid, googleDriveFolderId, googleDriveAPI)
            } else {
                await msgHandler(msg, `User ${userUid} not authorized to upload images to Google drive`,false)
            }
            
        } else if(msg.text === '/h'){
            await msgHandler(msg, `PicSync Bot Commands include : \n/h : help\n/s : current status of file uploads\n/c : clear file uploads status`)
        } else if(msg.text === '/s'){
            const statusMessage = printCurrentStatus();
            await msgHandler(msg, statusMessage, true)
        } else if(msg.text === '/c'){
            clearStatus()
            await msgHandler(msg,  `cleared file status`)
        } else {
            if(msg.text){
                await msgHandler(msg, `${userUid} says ${msg.text}`)
            } else {
                await msgHandler(msg, `${userUid} sent a different type of message.`)
            }   
        }

    } catch (err) {
        await handleMultipleRequestsError(err, msg);
    }

});


const handleShutdown = async (signal) => {
    console.log(`Received signal ${signal}. Shutting down the server`)
    if(chatInstance!==''){
       await msgHandler(chatInstance, "Bot Pic Sync will be down for sometime, Meet you soon.", false)
    }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
