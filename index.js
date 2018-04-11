const os = require('os');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const conf = require('./config.js');
const moment = require('moment');
const ip = require('ip');

let slog;
let logLevel = 'warn';
let logPath;
let serviceName = null;
let hostIP = ip.address();

exports.init = (_serviceName) => {
    console.log("Initialising service file logging");
    serviceName = _serviceName;

    logPath = path.join(conf.msFilesPath, 'logs');

    mkdirp.sync(logPath, (err) => {
        if (err) {
            console.error('Unable to open or create logs directory directory: ' + logPath + '. Error: ' + err);
            throw(err);
        }
    });

    const opts = {
        logDirectory: logPath,
        fileNamePattern: '<DATE>.log',
        dataFormat: 'YYYY.MM.DD'
    };

    slog = require('simple-node-logger').createRollingFileLogger(opts);

    //Setting up logging level (from config file)
    updateLogLevel();

    //Registering a callback function to changes in configs
    conf.regChangesCallback(updateLogLevel);
    console.log("Service file logging initialised successfully! Log files directory: " + logPath);

    //Setting up a routine for old log files deletion (once in 25hrs)
    deleteOldLogs();
    setInterval(deleteOldLogs, 86400000)
};

const updateLogLevel = (oldConfig = null, newConfig = null) => {
    //Logging levels:
    //trace, debug, info, warn, error, fatal

    if (conf.config !== null && conf.config.main !== null && conf.config.main.logLevel !== null) {
        let t = conf.config.logLevel;
        if (t === 'trace' || t === 'debug' || t === 'info' || t === 'warn' || t === 'error' || t === 'fatal') {
            logLevel = t;
            slog.setLevel(logLevel);
            console.log("Logging level is set to " + logLevel);
        }
    }
};

const deleteOldLogs = () => {
    fs.readdir(logPath, (err, items) => {
        for (let i = 0; i < items.length; i++) {
            if (path.extname(items[i]) === '.log') {
                let fullPath = path.join(logPath, items[i]);
                let fStats = fs.statSync(fullPath);
                let seconds = (new Date().getTime() - fStats.mtime) / 1000;
                let hours = seconds / 60 / 60;
                let days = hours / 24;
                if (days >= 3) {
                    fs.unlinkSync(fullPath);
                }
            }
        }
    });
};

exports.fatal = (_msg) => {
    let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + "( " + hostIP + ")";
    let msg = {
        service: serviceName,
        ip: hostIP,
        time: moment().toISOString(),
        type: "F",
        text: _msg
    };
    console.log('FATAL: ' + msg_text);
    slog.log('fatal', msg_text);

};

exports.error = (_msg) => {
    let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + "( " + hostIP + ")";
    let msg = {
        service: serviceName,
        ip: hostIP,
        time: moment().toISOString(),
        type: "E",
        text: _msg
    };
    console.log('ERROR: ' + msg_text);
    slog.log('error', msg_text);

};

exports.warn = (_msg) => {
    let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + "( " + hostIP + ")";
    let msg = {
        service: serviceName,
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
        let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + "( " + hostIP + ")";
        let msg = {
            service: serviceName,
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
        let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + " (" + hostIP + ")";
        let msg = {
            service: serviceName,
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
        let msg_text = serviceName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg + " (" + hostIP + ")";
        let msg = {
            service: serviceName,
            ip: hostIP,
            time: moment().toISOString(),
            type: "T",
            text: _msg
        };
        console.log('TRACE: ' + msg_text);
        slog.log('trace', msg_text);

    }
};
