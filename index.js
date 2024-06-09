require('dotenv').config();
const { google } = require('googleapis')

// user defined modules
const createBuffer = require('./modules/createBuffer')
const getUserId = require('./modules/getUserId')
const authorizeImageHandler = require('./modules/authorizeImageHandler')
const createDriveFolder = require('./modules/createDriveFolder')
const imageHandler = require('./modules/imageHandler')
const msgHandler = require('./modules/msgHandler')
const handleMultipleRequestsError = require('./modules/handleMultipleRequestsError')
const bot = require('./modules/bot')

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

// Setup Complete Here .......

bot.on('message', async (msg) => {

    // get userId of sender
    const userUid = getUserId(msg)
    const authorizedUserUid = authorizeImageHandler(userUid)

    try {
        // Check if the message contains a photo
        if (msg.photo) {

            if(authorizedUserUid===true){
                await imageHandler(msg, userUid, googleDriveFolderId, googleDriveAPI)
            } else {
                msgHandler(msg, `User ${userUid} not authorized to upload images to Google drive`)
            }
            
        } else {
            msgHandler(msg, `${userUid} sent a different type of message.`)
        }

    } catch (err) {
        await handleMultipleRequestsError(err, msg);
    }

});

