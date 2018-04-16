const logger = require('../index');
const logLevels = require('../constants/logLevels');
const db = require('../cassandra');

const configs = {
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
    taskId: 0,
    component: "M1-1",
    logLevel: logLevels.OFF
};

logger.init(configs);
logger.logFatal('f');
logger.logError('e');
logger.logInfo('i');
logger.logDebug('d');
logger.logTrace('t');

// logger.logFatal('FATALITY');