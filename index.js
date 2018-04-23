const moment = require('moment');
const _ = require('lodash');
const cassandra = require('cassandra-driver');
const fs = require('fs');
const path = require('path');
const lineReader = require('readline');

const logLevels = require('./constants/logLevels');
const logDir = './pendingLogs/';

const defaultConfigs = {
    contactPoints: ['0.0.0.0'],
    keyspace: '',
    tableName: '',
    component: '',
    logLevel: logLevels.OFF,
    localLogLimit: 500,
};

let logConfigs = null;
let queue = [];
let client = null;
let tableName = null;
let isConnected = false;
let query = null;
let numOfFilesPending = 0;
let logLimit = 0;

exports.init = (configs) => {

    let configsAreInvalid = checkConfigs(configs);
    if (configsAreInvalid) {
        console.error('Configs validation failed:', configsAreInvalid);
        logConfigs = defaultConfigs;

    } else {
        logConfigs = configs;
        logLimit = configs.localLogLimit;
    }

    let logFiles = fs.readdirSync(logDir);
    numOfFilesPending = logFiles.length;
    console.log('numOfPending:', numOfFilesPending);

    query = 'INSERT INTO ' + logConfigs.keyspace + '.' + logConfigs.tableName +
        ' (task_id, date_created, component, level, message) VALUES (?, ? , ?, ?, ?)';

    mockConnection();
    setInterval(mockConnection, 60000);
    setInterval(sendQueue, 500);
};

const checkConfigs = (configs) => {

    for (let key in defaultConfigs) {
        if (!(_.has(configs, key)))
            return (`${key} is missing from config list`);
    }

    if (configs.contactPoints.length < 1)
        return (`${configs.contactPoints} must have at least 1 item`);

    if (_.isNaN(configs.localLogLimit))
        return (`${configs.localLogLimit} must be a number`);

    return false;
};

const writeToFile = () => {
    let fileQueue = queue;
    queue = [];
    numOfFilesPending++;

    let file = fs.createWriteStream(logDir + '/logs' + numOfFilesPending.toString() + '.txt');

    try {
        fileQueue.forEach((v) => {
            file.write((JSON.stringify(v)) + '\n')
        })
    } catch (e) {
        console.error('Error writing to file:', e)
    }
};

const sendFromFiles = () => {
    let logFiles = {};
    try {
        logFiles = fs.readdirSync(logDir);
    } catch (e) {
        console.error('Error opening directory' + logDir + ' :', e)
    }

    for (let i in logFiles) {
        let currLogFile = logFiles[i];

        if (path.extname(currLogFile) !== '.txt') continue;

        let currLog = [];
        let currFilePath = path.join(logDir, currLogFile);

        try {
            currLog = fs.readFileSync(currFilePath,'utf-8').split('\n');

        } catch (e) {
            console.error('Insertion from file ' + currLogFile + ' failed: ', e);
        }

        let queries = [];

        for (let i in currLog) {
            if(currLog[i] === '') continue;

            let line = JSON.parse(currLog[i]);
            let params = [line.taskId, line.time, line.component, line.logLevel, line.text];

            queries.push({
                query: query,
                params: params
            });
        }

        try {
            client.batch(queries, {prepare: true}, (err) => {
                if (err) {
                    console.error('Log insertion failed: ', err);
                } else {
                    numOfFilesPending--;
                    fs.unlinkSync(currFilePath);
                }
            })
        } catch (err) {
            console.error('Insertion from file ' + currLogFile + ' failed: ', err);
        }

    }
};

const sendQueue = () => {
    let qlen = queue.length;

    if (qlen >= logLimit) {
        writeToFile();
        return;
    }

    if (numOfFilesPending > 0 && isConnected) {
        sendFromFiles();
    }

    if (qlen === 0 || !isConnected) {
        return;
    }

    let queries = [];

    for (let i in queue) {
        let params = [queue[i].taskId, queue[i].time, queue[i].component, queue[i].logLevel, queue[i].text];
        queries.push({
            query: query,
            params: params
        });
        queue.splice(0, qlen)
    }

    try {
        client.batch(queries, {prepare: true}, (err) => {
            if (err) {
                console.log('Log insertion failed: ', err);
            }
        })
    } catch (err) {
        console.log('Log insertion failed2: ', err);
    }


};

const mockConnection = () => {

    client = new cassandra.Client({
        contactPoints: logConfigs.contactPoints,
        keyspace: logConfigs.keyspace,
    });

    client.connect((err) => {
        if (err) {
            console.error('Connection to database server failed: ', err);
            isConnected = false;
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