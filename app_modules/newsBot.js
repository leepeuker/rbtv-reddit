const config = require('config');
const reddit = require('./reddit');
const request = require('request');
const moment = require('moment');

let newsBot = config.get('newsBot');
let dateLatestTopic = 0;

let start = (redditUser) => {
    console.log('Starting newsbot...')

    reddit.auth(redditUser);

    request({
        url: `https://leepeuker.de/test.json`,
        json: true
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            console.log('Unable to connect to server.');
        } else {

            let topics = body.topic_list.topics;

            for (i = 0; i < topics.length; i++) { 

                if (moment(topics[i].created_at).isAfter(dateLatestTopic)) {

                    dateLatestTopic = topics[i].created_at;
                } 
                
                if (topics[i].pinned === false) {

                    break;
                }
            }
            
            console.log(`NewsBot initialed date for latest topic: ${dateLatestTopic}`)

            setInterval(() => {

                request({
                    url: `https://leepeuker.de/test.json`,
                    json: true
                }, (error, response, body) => {
                    if (error || response.statusCode !== 200) {
                        console.log('Unable to connect to server.');
                    } else {

                        let topics = body.topic_list.topics;
                        let newDateLatestTopic = dateLatestTopic;

                        for (i = 0; i < topics.length; i++) { 

                            if (moment(topics[i].created_at).isAfter(dateLatestTopic)) {

                                reddit.submitSelflink({
                                    title: topics[i].title,
                                    url: `https://forum.rocketbeans.tv/t/${topics[i].slug}/${topics[i].id}`
                                });
            
                                if (moment(topics[i].created_at).isAfter(newDateLatestTopic)) {

                                    newDateLatestTopic = topics[i].created_at;
                                }
                            }
                        }
                        
                        if (moment(dateLatestTopic).isAfter(newDateLatestTopic)) {
                            dateLatestTopic = newDateLatestTopic;
                        } else {
                            console.log('newsBot: No new topic.');
                        }
                    }
                });

            }, newsBot.updateInterval)
        }
    });

};

module.exports.start = start;