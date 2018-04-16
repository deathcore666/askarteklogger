const moment = require('moment');
const logger = require('../index');
const logLevels = require('../constants/logLevels');
const db = require('../cassandra');

const testConfigs = {
    taskId: 123,
    component: "M1-1",
    time: moment().toISOString(),
    logLevel: logLevels.TRACE,
};

const msg = {
    taskId: 12,
    time: moment().toISOString(),
    service: 'M1-1',
    logLevel: logLevels.TRACE,
    text: 'test'
};

const dbConf = {
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
};

logger.init();
// logger.logFatal('FATALITY');