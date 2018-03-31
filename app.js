const config = require('config');
const dailyProgramBot = require('./app_modules/dailyProgramBot');
const newsBot = require('./app_modules/newsBot');

// Start the bots
dailyProgramBot.start(config.get('dailyProgramBot.redditAccount'));
newsBot.start(config.get('newsBot.redditAccount'));

