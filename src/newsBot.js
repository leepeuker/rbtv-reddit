const logger   = require('./logger').get();
const schedule = require('node-schedule');
const reddit   = require('./reddit');
const request  = require('request');
const config   = require('config');
const moment   = require('moment');

let newsBot = config.get('newsBot');

// Start the bot
let start = (redditUser, scheduleExpression) => {
    logger.info('Bot started'); 

    reddit.auth(redditUser);
    let dateLatestTopic = 0;

    request({
        url: newsBot.url,
        json: true
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            logger.error(`Unable to connect to server (${response.request.uri.href}).`);
        } else {

            let topics = body.topic_list.topics;

            for (i = 0; i < topics.length; i++) { 

                if (moment(topics[i].created_at).isAfter(dateLatestTopic)) {
                    dateLatestTopic = topics[i].created_at;
                } 
                
                if (topics[i].pinned === false) {
                    logger.info(`Set date for latest topic: ${dateLatestTopic}`); 
                    break;
                }
            }

            schedule.scheduleJob(scheduleExpression, () => {
                request({
                    url: newsBot.url,
                    json: true
                }, (error, response, body) => {
                    if (error || response.statusCode !== 200) {
                        logger.error(`Unable to connect to server (${response.request.uri.href}).`);
                    } else {

                        let topics = body.topic_list.topics;
                        let newDateLatestTopic = dateLatestTopic;

                        for (i = 0; i < topics.length; i++) { 

                            if (moment(topics[i].created_at).isAfter(dateLatestTopic)) {
                                reddit.submitSelflink({
                                    subreddit: newsBot.subreddit,
                                    title: topics[i].title,
                                    url: `https://forum.rocketbeans.tv/t/${topics[i].slug}/${topics[i].id}`
                                }, submission => { 
                                    logger.info('Created new topic: ' + submission.url); 
                                    submission.selectFlair({flair_template_id: 'f4acf132-c5ed-11e4-9500-22000b230151'});
                                });
            
                                if (moment(topics[i].created_at).isAfter(newDateLatestTopic)) {
                                    newDateLatestTopic = topics[i].created_at;
                                }
                            }
                        }
                        
                        if (moment(newDateLatestTopic).isAfter(dateLatestTopic)) {
                            dateLatestTopic = newDateLatestTopic;
                        } else {
                            logger.info('No new topics found.');
                        }
                    }
                });
            });
        }
    });

};

module.exports.start = start;