const moment = require('moment');
// const logger = require('./logger');
const logLevels = require('./constants/logLevels');

const testConfigs = {
    taskId: 123,
    component: "M1-1",
    time: moment().toISOString(),
    logLevel: logLevels.TRACE,
};

// logger.logInit(testConfigs);
// logger.logDebug('Someshit just happened yo');