require('dotenv').config();

function authorizeImageHandler(userUid){
    const authorizedUsers = process.env.AUTHORIZED_USERS;
    const authorizedUsersList = authorizedUsers.split(',');
    return authorizedUsersList.includes(userUid);
}

module.exports = authorizeImageHandler