const reddit = require('./reddit');
const request = require('request');
const moment = require('moment');

let start = (redditAccount) => {
    console.log('Starting dailyProgramBot...')

    reddit.auth(redditAccount);

    request({
        url: `http://thegremium.org/~doc/rbtv/wopla/wopla.data.json`,
        json: true
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            console.log('Unable to connect to server.');

        } else {
            let date = moment().format('DD.MM.YYYY');
            let time = moment().format('HH:mm:ss');
            let weekDay = moment().isoWeekday() - 1;

            let shows = body[0].days[weekDay].shows;
            let showsString = showsToString(shows);

            reddit.submitSelftext({
                title: `[${date}] Diskussion zum Programm des Tages`,
                body: `${showsString}\n\nFalls jemand event- oder sendungsspezifische Threads über diesen hier hinaus für sinnvoll hält, dürfen diese natürlich weiterhin erstellt werden.`
            });
        }
    });
};

let showsToString = (shows) => {
    let showsString = '';

    shows.forEach(show => {

        showsString += `${show.time} - `;

        if (show.isPremiere === true) {
            showsString += `**${show.title}** (neu)`;

        } else if (show.isLive === true) {
            showsString += `**${show.title}** (live)`;

        } else {
            showsString += `${show.title}`;
        }

        showsString += '\n\n';
    });

    return showsString;
};

module.exports.start = start;