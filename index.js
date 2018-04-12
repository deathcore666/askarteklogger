const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const moment = require('moment');
const ip = require('ip');

const cassandra = require('./cassandra');
const logLevels = require('./constants/logLevels');
const defaultConfigs = {
    taskId: null,
    component: "SCORING",
    time: moment().toISOString(),
    logLevel: logLevels.OFF,
    text: null,
};

let logConfigs = {};
let initLogLevel = null;

exports.logInit = (configs) => {
    console.log("Initialising service file logging");

    //Setting default settings if none provided
    logConfigs = {...defaultConfigs, ...configs};
    if(logConfigs.logLevel === logLevels.OFF) {
        initLogLevel = 0;
    } else if(logConfigs.logLevel === logLevels.FATAL) {
        initLogLevel = 1;
    } else if(logConfigs.logLevel === logLevels.ERROR) {
        initLogLevel = 2;
    } else if(logConfigs.logLevel === logLevels.WARN) {
        initLogLevel = 3;
    } else if(logConfigs.logLevel === logLevels.INFO) {
        initLogLevel = 4;
    } else if(logConfigs.logLevel === logLevels.DEBUG) {
        initLogLevel = 5;
    } else if(logConfigs.logLevel === logLevels.TRACE) {
        initLogLevel = 6;
    }

    console.log("Service file logging initialised successfully!");

    //Setting up a routine for old log files deletion (once in 25hrs)
    deleteOldLogs();
    setInterval(deleteOldLogs, 86400000)
};


const deleteOldLogs = () => {
    //TODO
};

exports.logFatal = (_msg) => {
    if(initLogLevel >= 1) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.FATAL,
            text: _msg
        };
        console.log(logLevels.FATAL + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};

exports.logError = (_msg) => {
    if(initLogLevel >= 2) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.ERROR,
            text: _msg
        };
        console.log(logLevels.ERROR + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};

exports.logWarn = (_msg) => {
    if(initLogLevel >= 3) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.WARN,
            text: _msg
        };
        console.log(logLevels.WARN + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};

exports.logInfo = (_msg) => {
    if (initLogLevel >= 4) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.INFO,
            text: _msg
        };
        console.log(logLevels.INFO + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};

exports.logDebug = (_msg) => {
    if (initLogLevel >= 5) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.DEBUG,
            text: _msg
        };
        console.log(logLevel.DEBUG + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};

exports.logTrace = (_msg) => {
    if (initLogLevel >= 6) {
        let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
        let msg = {
            taskId: logConfigs.taskId,
            component: logConfigs.component,
            time: moment().toISOString(),
            logLevel: logLevels.TRACE,
            text: _msg
        };
        console.log(logLevels.TRACE + ': ' + msg_text);
        cassandra.insertLog(msg);
    }
};
