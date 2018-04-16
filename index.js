const moment = require('moment');
const _ = require('lodash');

const cassandra = require('./cassandra');
const logLevels = require('./constants/logLevels');

const logLevelsMap = {
    0: 'OFF',
    1: 'FATAL',
    2: 'ERROR',
    3: 'WARN',
    4: 'INFO',
    5: 'DEBUG',
    6: 'TRACE'
};

const defaultConfigs = {
    contactPoints: ['0.0.0.0'],
    keyspace: '',
    tableName: '',
    taskId: 0,
    component: '',
};

let logConfigs = null;
let initLogLevel = null;

const validateConfigs = (configs) => {
    return new Promise((resolve, reject) => {
        for (let key in defaultConfigs) {
            if (!(_.has(configs, key)))
                reject(`${key} is missing from config list`);
        }

        if (configs.contactPoints.length < 1) {
            reject(`${configs.contactPoints} must have at least 1 item`);
        }

    });
};

exports.init = (configs) => {
    //Setting default settings if none provided

    let valid = validateConfigs(configs);
    valid.then(() => {
        logConfigs = configs;
    }).catch((err) => {
        console.error('Configs validation failed: ', err);
        logConfigs = defaultConfigs;
    });

    let connect = cassandra.connect(defaultConfigs);
    connect.then((result) => {
    }).catch((err) => {
        console.error('Connection to Cassandra failed: ', err);
        console.error('Logging initialisation failed!')
    });
};

exports.logFatal = (_msg) => {
    if (logConfigs.logLevel < 2)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.FATAL],
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logError = (_msg) => {
    if (initLogLevel < 3)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.ERROR],
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logWarn = (_msg) => {
    if (initLogLevel < 4)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.WARN],
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logInfo = (_msg) => {
    if (initLogLevel < 5)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.INFO],
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logDebug = (_msg) => {
    if (initLogLevel < 6)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.DEBUG],
        text: _msg
    };
    cassandra.insertLog(msg);
};

exports.logTrace = (_msg) => {
    if (initLogLevel < 7)
        return;

    let msg = {
        taskId: logConfigs.taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevelsMap[logLevels.TRACE],
        text: _msg
    };
    cassandra.insertLog(msg);
};