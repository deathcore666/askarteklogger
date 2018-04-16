const moment = require('moment');

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
    contactPoints: ['192.168.1.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
    taskId: 666,
    component: "SCORING",
    time: moment().toISOString(),
    logLevel: logLevels.WARN,
};

let logConfigs = null;
let initLogLevel = null;

exports.init = (configs) => {
    console.log("Initialising service file logging");

    //Setting default settings if none provided
    if(!configs) {
        logConfigs = defaultConfigs;
    } else {
        logConfigs = configs;
    }

    let connect = cassandra.connect(logConfigs);
    connect.then((result) => {
        console.log(result);
        console.log('Service file logging initialised successfully!');
    },(err) => {
        console.error('Connection to Cassandra failed:',err)
        console.error('Logging initialisation failed!')
    });
};

exports.logFatal = (_msg) => {
    if(logConfigs.logLevel < 1)
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