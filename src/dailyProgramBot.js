const logger   = require('logger').createLogger('./logs/main.log');
const schedule = require('node-schedule');
const reddit   = require('./reddit');
const request  = require('request');
const config   = require('config');
const moment   = require('moment');

let dailyProgramBot = config.get('dailyProgramBot');

// Set the log format
logger.format = function(level, date, message) {
    return '[' + moment().format('DD.MM.YYYY HH:mm:ss') + '] [' + level + '] - dailyProgramBot: ' + message;
};

// Start the bot
let start = (redditAccount, scheduleExpression) => {
    logger.info('Bot started'); 

    reddit.auth(redditAccount);

    schedule.scheduleJob(scheduleExpression, () => {
        request({
            url: dailyProgramBot.url,
            json: true
        }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                logger.error(`Unable to connect to server (${response.request.uri.href}).`); 
            } else {
    
                let date = moment().format('DD.MM.YY');
                let time = moment().format('HH:mm:ss');
                let weekDay = moment().isoWeekday() - 1;
    
                let shows = body[0].days[weekDay].shows;
                let showsString = showsToString(shows);
    
                reddit.submitSelftext({
                    subreddit: dailyProgramBot.subreddit,
                    title: `[${date}] Diskussion zum Programm des Tages (mit Sendeplan)`,
                    body: `${showsString}----\n\nFalls jemand event- oder sendungsspezifische Threads über diesen hier hinaus für sinnvoll hält, dürfen diese natürlich weiterhin erstellt werden.`
                }, submission => { 
                    logger.info('Created new topic: ' + submission.url);
                    // submission.sticky({num: 2});
                    // submission.unsticky();
                });
            }
        });
    });
};

// Convert the shows from json to string
let showsToString = (shows) => {
    let showsString = '';
    let showGame = '';

    shows.forEach(show => {

        showsString += `${show.time} - `;

        if(show.game !== '') {
            show.game = ` - ${show.game}`;
        }

        if (show.isPremiere === true) {
            showsString += `**${show.title}${show.game}** (Neu)`;

        } else if (show.isLive === true) {
            showsString += `**${show.title}${show.game}** (Live)`;

        } else {
            showsString += `*${show.title}${show.game}*`;
        }

        showsString += '\n\n';
    });

    return showsString;
};

module.exports.start = start;