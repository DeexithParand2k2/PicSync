const bot = require('./bot')

// Function to handle errors while uploading multiple images
async function handleMultipleRequestsError(err, msg) {
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

module.exports = handleMultipleRequestsError