const moment = require('moment');
const fs = require('fs');
const path = require('path');

const cassandra = require('./cassandra');
const logLevels = require('./constants/logLevels');
const configPath = './configs';

const defaultConfigs = {
    taskId: null,
    component: "SCORING",
    time: moment().toISOString(),
    logLevel: logLevels.OFF,
};

let logConfigs = null;
let initLogLevel = null;

// moment.tz.setDefault("America/New_York");

exports.init = (configs) => {
    console.log("Initialising service file logging");


    //Setting default settings if none provided
    if(!configs) {
        let isReadError = false;
        const confFiles = fs.readdirSync(configPath);
        for (let i in confFiles) {
            let currFileName = confFiles[i];

            if (path.extname(currFileName) !== '.json') continue;

            let currConfigName = currFileName.replace(/\.[^/.]+$/, "");
            let currFilePath = path.join(configPath, currFileName);

            let currConfig = null;
            try {
                currConfig = JSON.parse(fs.readFileSync(currFilePath, 'utf8'));
                if (currConfigName === 'logConfig') {
                    logConfigs = currConfig;
                }
            } catch (err) {
                isReadError = true;
                console.error('Unable to read configuration file: ' + currFilePath + '. Error: ' + err);
            }
        }
    } else {
        logConfigs = configs;
    }

    console.log("Service file logging initialised successfully!");
    console.log(moment().toISOString());
};

exports.logFatal = (_msg) => {
    if(logConfigs.logLevel < 1)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.FATAL,
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logError = (_msg) => {
    if(initLogLevel < 2)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.ERROR,
        text: _msg
    };
    cassandra.insertLog(msg);

};

exports.logWarn = (_msg) => {
    if(initLogLevel < 3)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.WARN,
        text: _msg
    };
    cassandra.insertLog(msg);

};

exports.logInfo = (_msg) => {
    if (initLogLevel >= 4)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.INFO,
        text: _msg
    };
    cassandra.insertLog(msg);

};

exports.logDebug = (_msg) => {
    if (initLogLevel < 5)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.DEBUG,
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logTrace = (_msg) => {
    if (initLogLevel < 6)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevels.TRACE,
        text: _msg
    };
    cassandra.insertLog(msg);
};