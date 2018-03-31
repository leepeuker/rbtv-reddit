const config = require('config');
const snoowrap = require('snoowrap');

let redditUser = null;

exports.auth = (redditAccount) => {
    
    let redditAccountData = config.get('redditAccounts.' + redditAccount);

    redditUser = new snoowrap({
        userAgent: redditAccountData.userAgent,
        clientId: redditAccountData.clientId,
        clientSecret: redditAccountData.clientSecret,
        username: redditAccountData.username,
        password: redditAccountData.password
    });
};

exports.submitSelftext = (submission) => {
    redditUser.getSubreddit('nativesys').submitSelfpost({title: submission.title, text: submission.body}).then((submission) => {
        redditUser.getSubmission(submission).fetch().then((submission) => {console.log(`New Topic created: '${submission.title}', ${submission.url}`)});
    });
}

exports.submitSelflink = (submission) => {
    redditUser.getSubreddit('nativesys').submitLink({title: submission.title, url: submission.url}).then((submission) => {
        redditUser.getSubmission(submission).fetch().then((submission) => {console.log(`New Topic created: '${submission.title}', ${submission.url}`)});
    });
}