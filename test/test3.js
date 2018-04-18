const logger = require('../index');
const logLevels = require('../constants/logLevels');

const configs = {
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs',
    component: 'M2-3',
    logLevel: logLevels.TRACE
};

logger.init(configs);
logger.logTrace('test hi', 'task2');