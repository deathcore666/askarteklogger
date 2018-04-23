const fs = require('fs');

const logger = require('../index');
const logLevels = require('../constants/logLevels');

const configs = {
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs',
    tableName: 'testlogs',
    component: 'M2-3',
    logLevel: logLevels.TRACE,
    localLogLimit: 50,
};

logger.init(configs);
let i = 0;

function getCallback() {
    logger.logDebug('test debug message: '+ i++, '123');
    console.log('i:', i);
}

function writeFile() {

}

setInterval(getCallback, 1500);
