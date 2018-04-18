const logger = require('../index');
const logLevels = require('../constants/logLevels');

const configs = {
    contactPoints: ['192.168.1.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
    component: "M1-1",
    logLevel: logLevels.TRACE
};



// logger.logFatal('FATALITY');