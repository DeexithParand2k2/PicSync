const bot = require('./bot')

async function msgHandler(msg, replyMessage){
    await bot.sendMessage(msg.chat.id, replyMessage);
}

module.exports = msgHandler