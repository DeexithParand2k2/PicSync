async function createFolder(drive, folderName) {
    try {
        // Check if the folder already exists
        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (response.data.files.length > 0) {
            // Folder exists, return the ID
            const existingFolderId = response.data.files[0].id;
            console.log('Folder already exists. ID:', existingFolderId);
            return existingFolderId;
        }

        // Folder does not exist, create it
        const fileMetadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder'
        };

        const createResponse = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        console.log('Created folder ID:', createResponse.data.id);
        return createResponse.data.id;
    } catch (error) {
        console.error('Error creating or finding folder on Google Drive:', error.message);
        throw error;
    }
}

module.exports = createFolder;