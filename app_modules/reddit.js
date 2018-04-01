const snoowrap = require('snoowrap');
const config   = require('config');

let reddit = null;

// Create reddit object
exports.auth = (redditAccount) => {
    let accountData = config.get('redditAccounts.' + redditAccount);

    reddit = new snoowrap({
        userAgent: accountData.userAgent,
        clientId: accountData.clientId,
        clientSecret: accountData.clientSecret,
        username: accountData.username,
        password: accountData.password
    });
};

// Submit a new text post
exports.submitSelftext = (data, callback) => {
    reddit.getSubreddit(data.subreddit)
    .submitSelfpost({ title: data.title, text: data.body })
    .then(submissionTag => {
        reddit.getSubmission(submissionTag).fetch()
        .then(submission => {
            callback(submission);
        });
    });
};

// Submit a new link
exports.submitSelflink = (data, callback) => {
    reddit.getSubreddit(data.subreddit)
    .submitLink({title: data.title, url: data.url})
    .then(submissionTag => {
        reddit.getSubmission(submissionTag).fetch()
        .then(submission => {
            callback(submission);
        });
    });
};