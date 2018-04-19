const dailyProgramBot = require('./src/dailyProgramBot');
const logger          = require('./src/logger').get();
const newsBot         = require('./src/newsBot');
const config          = require('config');

logger.info('Starting bots...'); 

dailyProgramBot.start(config.get('dailyProgramBot.redditAccount'), config.get('dailyProgramBot.schedule'));
newsBot.start(config.get('newsBot.redditAccount'), config.get('newsBot.schedule'));