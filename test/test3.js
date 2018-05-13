const fs = require('fs');
const moment = require('moment');
c

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
// let file = fs.createWriteStream('./logsTest.txt');

function getCallback() {
    logger.logDebug('test debug message: '+ ++i, '123');
    console.log('i:', i);
}

function writeFile() {
    file.write('I is equal to '+ (++i).toString() +"\n");
    // file.close();
}

function fileCF() {
    let start = Date.now();
    try {
        for (let m = 0; m < 1000000; m ++) {
            file.write('m is ' + m.toString() + '\n');
        }
    } catch (e) {
        console.log('errror:', e);
    }

    let end = Date.now();
    console.log('1 mill records took:', end - start);
}

function cass() {
    let start = Date.now();
    for(let m = 0; m < 1000000; m++) {
        logger.logDebug('Message no. ' + m.toString(), 'task')
    }
    let end = Date.now();
    console.log('1 mill records took:', end - start);
}

// fileCF();
// cass();
// setInterval(getCallback, 600);
// console.log('time:', moment().format('hhmmDDMMYY'));

