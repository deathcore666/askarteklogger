const moment = require('moment');

const cassandra = require('./cassandra');
const logLevels = require('./constants/logLevels');

const defaultConfigs = {
    taskId: null,
    component: "SCORING",
    time: moment().toISOString(),
    logLevel: logLevels.OFF,
};

let logConfigs = {};
let initLogLevel = null;

exports.logInit = (configs) => {
    console.log("Initialising service file logging");

    //Setting default settings if none provided
    logConfigs = {...defaultConfigs, ...configs};

    console.log("Service file logging initialised successfully!");
};

exports.logFatal = (_msg) => {
    if(logConfigs.logLevel < 1)
        return;

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

};

exports.logError = (_msg) => {
    if(initLogLevel < 2)
        return;

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

};

exports.logWarn = (_msg) => {
    if(initLogLevel < 3)
        return;

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

};

exports.logInfo = (_msg) => {
    if (initLogLevel >= 4)
        return;

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

};

exports.logDebug = (_msg) => {
    if (initLogLevel < 5)
        return;

    let msg_text = logConfigs.component + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.DEBUG,
        text: _msg
    };
    console.log(logLevels.DEBUG + ': ' + msg_text);
    cassandra.insertLog(msg);
};

exports.logTrace = (_msg) => {
    if (initLogLevel < 6)
        return;

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
};
