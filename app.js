
const dailyProgramBot = require('./app_modules/dailyProgramBot');
const newsBot         = require('./app_modules/newsBot');
const config          = require('config');

// Start the bots
dailyProgramBot.start(config.get('dailyProgramBot.redditAccount'), config.get('dailyProgramBot.schedule'));
newsBot.start(config.get('newsBot.redditAccount'), config.get('newsBot.schedule'));