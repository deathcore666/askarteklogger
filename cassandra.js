const cassandra = require('cassandra-driver');
const async = require('async');
const path = require('path');
const fs = require('fs');

const configPath = './configs';
let client = null;

exports.init = (config) => {
    if(!config){
        let isReadError = false;
        const confFiles = fs.readdirSync(configPath);
        for (let i in confFiles) {
            let currFileName = confFiles[i];

            if (path.extname(currFileName) !== '.json') continue;

            let currConfigName = currFileName.replace(/\.[^/.]+$/, "");
            let currFilePath = path.join(configPath, currFileName);

            let currConfig = null;
            try {
                currConfig = JSON.parse(fs.readFileSync(currFilePath, 'utf8'));
                if (currConfigName === 'dbConfig') {
                    client = new cassandra.Client(currConfig);
                }
            } catch (err) {
                isReadError = true;
                console.error('Unable to read configuration file: ' + currFilePath + '. Error: ' + err);
            }
        }
    } else {
        client = new cassandra.Client({
            contactPoints: ['192.168.0.166'],
            keyspace: 'logs'
        });
    }

};

exports.insertLog = (msg) => {
    const query = 'INSERT INTO logs.testlogs1 (taskid, time, service, loglevel, text) VALUES (?, ? , ?, ?, ?)';
    const params = [msg.taskId, msg.time, msg.component, msg.logLevel, msg.text ];
    client.execute(query, params, { prepare: true }, onInsertLog)
};

const onInsertLog = (err) => {
    if(err) {
        console.log('insertLog failed:', err);
        return;
    }
    console.log('Log inserted successfully!');
};