const bot = require('./bot')

async function msgHandler(msg, replyMessage, markdown){

    if(markdown){
        await bot.sendMessage(msg.chat.id,`\`\`\`${replyMessage}\`\`\``, { parse_mode: 'Markdown' });
    } else {
        await bot.sendMessage(msg.chat.id, replyMessage);
    }

    
}

module.exports = msgHandler