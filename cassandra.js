const cassandra = require('cassandra-driver');
const async = require('async');

const client = new cassandra.Client({
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs'
});


exports.insertLog = (msg) => {
    const query = 'INSERT INTO logs.testlogs (taskid, time, service, loglevel, text) VALUES (?, ? , ?, ?, ?)';
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