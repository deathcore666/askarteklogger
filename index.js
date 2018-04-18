const moment = require('moment');
const _ = require('lodash');
const cassandra = require('cassandra-driver');

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
    component: '',
    logLevel: logLevels.OFF
};

let logConfigs = null;
let queue = [];
let client = null;
let tableName = null;
let keyspace = null;
let isConnected = false;
let query = null;

exports.init = (configs) => {

    let configsAreInvalid = checkConfigs(configs);
    if(configsAreInvalid) {
        console.error('Configs validation failed:', configsAreInvalid);
        logConfigs = defaultConfigs;
    } else {
        logConfigs = configs;
    }

    query = 'INSERT INTO '+ logConfigs.keyspace +'.' + logConfigs.tableName +
        ' (task_id, date_created, component, level, message) VALUES (?, ? , ?, ?, ?)';

    connectToDB(logConfigs);
    setInterval(sendQueue, 500);
};

const checkConfigs = (configs) => {

    for (let key in defaultConfigs) {
        if (!(_.has(configs, key)))
            return (`${key} is missing from config list`);
    }

    if (configs.contactPoints.length < 1)
        return (`${configs.contactPoints} must have at least 1 item`);

    return false;
};

const sendQueue = () => {
    let qlen = queue.length;

    if (qlen === 0 || !isConnected)
        return;

    for(let i in queue) {
        let params = [queue[i].taskId, queue[i].time, queue[i].component, queue[i].logLevel, queue[i].text];
        try{
            client.execute(query, params, { prepare: true }, (err)=>{
                if(err) {
                    console.error('Log insertion failed: ', err);
                } else {
                    queue.splice(0, qlen)
                }
            })
        } catch (err) {
            console.error('Log insertion failed: ', err);
        }
    }
};

const connectToDB = (configs) => {
    tableName = configs.tableName;
    keyspace = configs.keyspace;
    client = new cassandra.Client({
        contactPoints: configs.contactPoints,
        keyspace: configs.keyspace,
    });

    client.connect((err) => {
        if(err) {
            console.error('Connection to database server failed: ', err);
            return;
        }
        isConnected = true;
    })
};

const getMessage = (taskId, logLevel, msg) => {
    return {
        taskId: taskId,
        component: logConfigs.component,
        time: moment().toISOString(),
        logLevel: logLevel,
        text: msg
    };
};

exports.logFatal = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.FATAL)
        return;

    let msg = getMessage(taskId, logLevels.FATAL, _msg);
    queue.push(msg);
};

exports.logError = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.ERROR)
        return;

    let msg = getMessage(taskId, logLevels.ERROR, _msg);
    queue.push(msg);
};

exports.logWarn = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.WARN)
        return;

    let msg = getMessage(taskId, logLevels.WARN, _msg);
    queue.push(msg);
};

exports.logInfo = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.INFO)
        return;

    let msg = getMessage(taskId, logLevels.INFO, _msg);
    queue.push(msg);
};

exports.logDebug = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.DEBUG)
        return;

    let msg = getMessage(taskId, logLevels.DEBUG, _msg);
    queue.push(msg);
};

exports.logTrace = (_msg, taskId) => {
    if (logConfigs.logLevel < logLevels.TRACE)
        return;

    let msg = getMessage(taskId, logLevels.TRACE, _msg);
    queue.push(msg);
};