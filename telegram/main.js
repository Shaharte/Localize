const axios = require("axios");
const path = require('path');
const userSchema = require('./schema');
const { token } = require(__dirname + '/token.json');
const TelegramBot = require('node-telegram-bot-api');
const LocalizeBot = new TelegramBot(token, { polling: true });
const _ = require('lodash');

process.env.NTBA_FIX_319 = 1
const moment = require('moment');

require('events').EventEmitter.defaultMaxListeners = 15;


// Localize BOT
module.exports.Localize = async function (io) {
    io.on('connect', socket => {
        socket.on('chatMessage', async email => {
            const user = await userSchema.find({ email })
            let conversation;
            if (user.length) {
                conversation = user[0].conversation || []
                socket.emit('botMessage', { conversation });
            } else {
                conversation = [{ username: 'LocalizeBot', text: 'No such User', time: moment().format('HH:mm A') }]
                socket.emit('botMessage', { conversation });

            }

        })
        // console.log('From client: ', message)
        socket.on("disconnect", () => {
        });


    })

    try {
        LocalizeBot.on("text", async (msg, match) => {
            const time = moment().format('HH:mm A')
            const chatId = msg.chat.id || '';
            const { text = '' } = msg;
            const id = msg.from.username || ''
            let output = '';
            let wordsArr;
            await userSchema.updateOne({ id, isAlive: true }, { $inc: { messages: 1 }, $push: { conversation: { time, text, username: 'User' } } })
            const user = await userSchema.find({ id })
            if (text.toLowerCase().indexOf("/start") === 0) {
                wordsArr = text.split(" ")
                const email = wordsArr[1] || '';
                const start = wordsArr[0] || '';
                if (start === '/start') {
                    if (user.length && user[0].isAlive) {
                        output = `User already signed in`
                    } else {
                        const startTime = moment().utc().format('YYYY-MM-DD:HH:mm:ss')
                        const newUser = {
                            email,
                            id,
                            messages: 0,
                            startTime,
                            conversation: [{ time, text, username: 'User' }],
                            isAlive: true
                        }
                        await userSchema.findOneAndUpdate({ id }, newUser, { upsert: true, new: true });

                        if (validateEmail(email)) {
                            output = `Hi, how can i help you today?\n/freetext <text>\n/getinfo\n/end`;
                        } else {
                            output = `Hi, please enter a valid email.`;
                        }
                    }
                } else {
                    output = `Sorry, didn't get it.`;
                }

            }
            else if (text.toLowerCase().indexOf("/freetext") === 0) {
                if (user.length && user[0].isAlive) {
                    wordsArr = text.split(" ")
                    const pharse = wordsArr[0] || '';
                    const freeText = wordsArr[1] || '';
                    if (pharse === '/freetext') {
                        if (freeText) {
                            const options = {
                                method: 'GET',
                                url: `https://api.kanye.rest`
                            }
                            try {
                                const response = await axios(options);
                                if (response.status === 200) {
                                    const { quote } = response.data;
                                    output = quote;
                                } else {
                                    output = 'Error getting API data';
                                }
                            } catch (err) {
                                output = 'Error getting API data';
                            }
                        }

                        else {
                            output = 'You didnt Put any text :)';

                        }
                    } else {
                        output = `Sorry, didn't get it.`;
                    }
                } else {
                    output = `User hasn't sign in yet.`;
                }
            }
            else if (text === '/getinfo') {
                if (user.length) {
                    const messageTime = user[0].isAlive ? moment().utc().format('YYYY-MM-DD:HH:mm:ss') : user[0].endTime;
                    const { messages = 0, startTime = '' } = user[0];
                    const duration = moment.utc(moment(messageTime, 'YYYY-MM-DD:HH:mm:ss').diff(moment(startTime, 'YYYY-MM-DD:HH:mm:ss'))).format("ss");
                    const converstionTome = messages > 0 ? duration / messages : 0;
                    output += `User number of messages: ${messages}\nUser conversion time: ${converstionTome} (avarge massage every ${converstionTome} seconeds)`;

                } else {
                    output = `User hasn't sign in yet.`;
                }
            }
            else if (text === '/end') {
                if (user.length && user[0].isAlive) {
                    const endTime = moment().utc().format('YYYY-MM-DD:HH:mm:ss')
                    output = 'OK, we are done here'
                    await userSchema.updateOne({ id }, { isAlive: false, endTime })

                } else {
                    output = `User hasn't sign in yet.`;
                }
            }
            else {
                output = `Sorry, didn't get it.`;
            }
            LocalizeBot.sendMessage(chatId, output);
            await userSchema.updateOne({ id }, { $push: { conversation: { time, text: output, username: 'LocalizeBot' } } })
        });

    } catch (err) {

    }
};

/* 
Input - string email
validate if the email is at xxx@xxx.xxx format
Output - true if email is valie
*/
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email)


}