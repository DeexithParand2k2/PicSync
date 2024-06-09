const bot = require('./bot')

function msgHandler(msg, replyMessage){
    bot.sendMessage(msg.chat.id, replyMessage);
}

module.exports = msgHandler