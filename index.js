const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const moment = require('moment');
const ip = require('ip');

const cassandra = require('./cassandra');
const logLevel = require('./constants/logLevels');

let componentName = null;
let taskId = null;

exports.logInit = (_componentName, _taskId) => {
    console.log("Initialising service file logging");
    componentName = _componentName;
    taskId = _taskId;

    console.log("Service file logging initialised successfully! Log records are stored in ");

    //Setting up a routine for old log files deletion (once in 25hrs)
    deleteOldLogs();
    setInterval(deleteOldLogs, 86400000)
};


const deleteOldLogs = () => {
    //TODO
};

exports.logFatal = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.FATAL,
        text: _msg
    };
    console.log(logLevel.FATAL + ': ' + msg_text);
    cassandra.insertLog(msg);

};

exports.logError = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.ERROR,
        text: _msg
    };
    console.log(logLevel.ERROR + ': ' + msg_text);
    cassandra.insertLog(msg);

};

exports.logWarn = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.WARN,
        text: _msg
    };
    console.log(logLevel.WARN + ': ' + msg_text);
    cassandra.insertLog(msg);

};

exports.logInfo = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.INFO,
        text: _msg
    };
    console.log(logLevel.INFO + ': ' + msg_text);
    cassandra.insertLog(msg);
};

exports.logDebug = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.DEBUG,
        text: _msg
    };
    console.log(logLevel.DEBUG + ': ' + msg_text);
    cassandra.insertLog(msg);
};

exports.logTrace = (_msg) => {
    let msg_text = componentName + ": " + moment().format("YYYY-MM-DD HH:mm:ss") + " " + _msg;
    let msg = {
        taskId: taskId,
        service: componentName,
        time: moment().toISOString(),
        type: logLevel.TRACE,
        text: _msg
    };
    console.log(logLevel.TRACE + ': ' + msg_text);
    cassandra.insertLog(msg);
};
