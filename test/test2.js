const logger = require('../index');
const logLevels = require('../constants/logLevels');

const unvalidConfigs = {
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
    component: "M1-1",
    logLevel: logLevels.OFF
};

logger.init(unvalidConfigs);