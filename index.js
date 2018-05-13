const moment = require('moment');
const _ = require('lodash');
const cassandra = require('cassandra-driver');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const logLevels = require('./constants/logLevels');

const defaultConfigs = {
    contactPoints: ['0.0.0.0'],
    keyspace: '',
    tableName: '',
    component: '',
    logLevel: logLevels.OFF,
    localLogLimit: 500,
};
const logDir = './pendingLogs/';

let logConfigs = null;
let queue = [];
let client = null;
let isConnected = false;
let query = null;
let numOfFilesPending = 0;
let linesWrittenToFile = 0;
let logLimit = 0;
let currLogFile = '';

exports.init = (configs) => {

    let configsAreInvalid = checkConfigs(configs);
    if (configsAreInvalid) {
        console.error('Configs validation failed:', configsAreInvalid);
        logConfigs = defaultConfigs;

    } else {
        logConfigs = configs;
        logLimit = configs.localLogLimit;
    }
    mkdirp.sync(logDir, function (err) {
        if (err) {
            console.error('Can\'t open or create directory for temp logs: ' + logDir + '. Error : ' + err);
            throw (err);
        }
    });

    let logFiles = fs.readdirSync(logDir);
    numOfFilesPending = logFiles.length;

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
    let qlen = fileQueue.length;

    currLogFile = logDir + 'logs' + moment().format('hhmmDDMMYY').toString() + numOfFilesPending.toString() + '.txt';

    for (let i = 0; i < qlen; i++) {
        try {
            fs.appendFileSync(currLogFile, (JSON.stringify(fileQueue[i])) + '\n');
            linesWrittenToFile++;
        }
        catch
            (err) {
            console.error('Error writing to file:', err);
            return;
        }
    }

    queue = [];

    if (linesWrittenToFile >= logLimit) {
        numOfFilesPending++;
    }
};

const sendFromFiles = () => {
    let logFiles = {};

    try {
        logFiles = fs.readdirSync(logDir);
    } catch (err) {
        console.error('Error reading directory ' + logDir + ' :', err);
        return;
    }

    for (let i in logFiles) {
        let isReadError = false;
        let currLogFile = logFiles[i];

        if (path.extname(currLogFile) !== '.txt') continue;

        let currLog = [];
        let currFilePath = path.join(logDir, currLogFile);

        try {
            currLog = fs.readFileSync(currFilePath, 'utf-8').split('\n');
        } catch (err) {
            console.error('Can\'t open ' + currLogFile + ' file: ', err);
            isReadError = true;
        }

        if (!isReadError) {
            let queries = [];

            for (let i in currLog) {
                if (currLog[i] === '') continue;

                let line = {};
                try {
                    line = JSON.parse(currLog[i]);
                } catch (err) {
                    console.error('Error reading log record: ', err);
                    continue;
                }

                let params = [line.taskId, line.time, line.component, line.logLevel, line.text];

                queries.push({
                    query: query, // 'INSERT INTO'
                    params: params
                });
            }

            client.batch(queries, {prepare: true})
                .then(function () {
                    numOfFilesPending--;
                    fs.unlinkSync(currFilePath);
                })
                .catch(function (err) {
                    console.error('Log insertion from file ' + currLogFile + ' failed: ', err);
                })
        }
    }
};

const sendQueue = () => {
    let pendingQueue = queue;
    let qlen = pendingQueue.length;

    if (isConnected) {
        sendFromFiles();
    }

    if (qlen === 0) {
        return;
    }

    if (!isConnected) {
        writeToFile();
    }

    let queries = [];

    for (let i in pendingQueue) {
        let params = [pendingQueue[i].taskId, pendingQueue[i].time, pendingQueue[i].component,
            pendingQueue[i].logLevel, pendingQueue[i].text];

        queries.push({
            query: query,
            params: params
        });
        pendingQueue.splice(0, qlen)
    }

    client.batch(queries, {prepare: true})
        .then(function () {
            queue = [];
        })
        .catch(function (err) {
            console.error('Error executing insertion: ', err);
            mockConnection();
        })
};

const mockConnection = () => {

    client = new cassandra.Client({
        contactPoints: logConfigs.contactPoints,
        keyspace: logConfigs.keyspace,
    });

    client.connect((err) => {
        if (err) {
            console.error('Connection to log database server failed: ', err);
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