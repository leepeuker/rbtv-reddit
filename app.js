
const dailyProgramBot = require('./src/dailyProgramBot');
const newsBot         = require('./src/newsBot');
const config          = require('config');

// Start the bots
dailyProgramBot.start(config.get('dailyProgramBot.redditAccount'), config.get('dailyProgramBot.schedule'));
newsBot.start(config.get('newsBot.redditAccount'), config.get('newsBot.schedule'));