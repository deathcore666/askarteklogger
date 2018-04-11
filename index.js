const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const moment = require('moment');
const ip = require('ip');

let componentName = null;

exports.logInit = (_serviceName) => {
    console.log("Initialising service file logging");
    componentName = _componentName;

    console.log("Service file logging initialised successfully! Log records are stored in ");

    //Setting up a routine for old log files deletion (once in 25hrs)
    deleteOldLogs();
    setInterval(deleteOldLogs, 86400000)
};


const deleteOldLogs = () => {
    //TODO
};

exports.fatal = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        service: componentName,
        ip: hostIP,
        time: moment().toISOString(),
        type: "F",
        text: _msg
    };
    console.log('FATAL: ' + msg_text);
    slog.log('fatal', msg_text);

};

exports.error = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        service: componentName,
        ip: hostIP,
        time: moment().toISOString(),
        type: "E",
        text: _msg
    };
    console.log('ERROR: ' + msg_text);
    slog.log('error', msg_text);

};

exports.warn = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        service: componentName,
        ip: hostIP,
        time: moment().toISOString(),
        type: "W",
        text: _msg
    };
    console.log('WARN: ' + msg_text);
    slog.log('warn', msg_text);

};

exports.info = (_msg) => {
    if (logLevel === 'info' || logLevel === 'debug' || logLevel === 'trace') {
        let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            service: componentName,
            ip: hostIP,
            time: moment().toISOString(),
            type: "I",
            text: _msg
        };
        console.log('INFO: ' + msg_text);
        slog.log('info', msg_text);

    }
};

exports.debug = (_msg) => {
    if (logLevel === 'debug' || logLevel === 'trace') {
        let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            service: componentName,
            ip: hostIP,
            time: moment().toISOString(),
            type: "D",
            text: _msg
        };
        console.log('DEBUG: ' + msg_text);
        slog.log('debug', msg_text);

    }
};

exports.trace = (_msg) => {
    if (logLevel === 'trace') {
        let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            service: componentName,
            ip: hostIP,
            time: moment().toISOString(),
            type: "T",
            text: _msg
        };
        console.log('TRACE: ' + msg_text);
        slog.log('trace', msg_text);

    }
};
