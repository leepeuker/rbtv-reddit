const schedule = require('node-schedule');
const logger   = require('./logger').get();
const reddit   = require('./reddit');
const request  = require('request');
const config   = require('config');
const moment   = require('moment');

let dailyProgramBot = config.get('dailyProgramBot');

// Start the bot
let start = (redditAccount, scheduleExpression) => {

    logger.info('Bot started.');

    reddit.auth(redditAccount);

    schedule.scheduleJob(scheduleExpression, () => {

        let showsString = '';
        let date = moment().format('DD.MM.YY');
        let dateDay = moment().format('DD');
        let dateMonth = moment().format('MM');
        let dateYear = moment().format('YYYY');

        request({
            url: dailyProgramBot.url+dateYear+'/'+dateMonth+'/'+dateDay+'.json',
            json: true
        }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                logger.error(`Unable to connect to server (${response.request.uri.href}).`); 
            } else {
                showsString = showsToString(body.schedule);
    
                if (showsString !== '') {
                    reddit.submitSelftext({
                        subreddit: dailyProgramBot.subreddit,
                        title: `[${date}] Programm des Tages`,
                        body: `${showsString}----\n\nFalls jemand event- oder sendungsspezifische Threads über diesen hier hinaus für sinnvoll hält, dürfen diese gerne zusätzlich erstellt werden.`
                    }, submission => { 
                        logger.info('Created new topic: ' + submission.url);
                        submission.sticky({num: 2});
                    });
                } else {
                    logger.error(`Unable to get show informations from the API call.`); 
                }
            }
        });
    });
};

// Convert the shows from json to string
let showsToString = (shows) => {
    let showsString = '';
    let showGame = '';

    shows.forEach(show => {

        show.timeStart = moment(show.timeStart).format('HH:mm');
        showsString += `${show.timeStart} - `;

        if(show.topic !== '') {
            show.topic = ` - ${show.topic}`;
        }

        if (show.type === 'premiere') {
            showsString += `**${show.title}${show.topic}** (Neu)`;

        } else if (show.type === 'live') {
            showsString += `**${show.title}${show.topic}** (Live)`;

        } else {
            showsString += `*${show.title}${show.topic}*`;
        }

        showsString += '\n\n';
    });

    return showsString;
};

module.exports.start = start;