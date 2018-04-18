const winston = require('winston');
const moment  = require('moment');
const fs      = require('fs');

function getCallingModule (depth) {
    let pst, stack, file, frame;

    pst = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        Error.prepareStackTrace = pst;
        return stack;
    };

    stack = (new Error()).stack;
    depth = 1;
    depth = !depth || isNaN(depth) ? 1 : (depth > stack.length - 2 ? stack.length - 2 : depth);
    stack = stack.slice(depth + 1);

    do {
        frame = stack.shift();
        file = frame && frame.getFileName();
    } while (stack.length && file === 'module.js');

    return file.match(/\w*.js/)[0].slice(0,-3);
};

exports.get = () => {

    // Delete old log
    if (fs.existsSync('logs/main.log')) {
        fs.unlinkSync('logs/main.log');
    }

    let callingModule = getCallingModule();

    // Create new winston instance
    return new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                filename: 'logs/main.log',
                json: false,
                maxsize: 5000000,
                formatter: function(obj) {
                    return moment().format('YYYY-MM-DD HH:mm:ss') + ' - ' +
                    obj.level + ':' +
                    callingModule + ' - ' +
                    (obj.message ? obj.message : '');
                }
            })
        ]
    });
};