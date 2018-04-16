const logger = require('../index');
const logLevels = require('../constants/logLevels');

const unvalidConfigs = {
    contffacastPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs1',
    taskId: '0',
    component: "M1-1",
    logLevel: logLevels.OFF
};

logger.init(unvalidConfigs);