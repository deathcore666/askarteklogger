const cassandra = require('cassandra-driver');

let client = null;
let tableName = null;
let keyspace = null;

exports.connect = (config) => {
    tableName = config.tableName;
    keyspace = config.keyspace;
    client = new cassandra.Client({
        contactPoints: config.contactPoints,
        keyspace: config.keyspace,
    });

    return new Promise((resolve, reject) => {
        client.connect((err) =>{
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
};

exports.insertLog = (msg) => {
    const query = 'INSERT INTO '+ keyspace +'.' + tableName +
        ' (taskid, time, service, loglevel, text) VALUES (?, ? , ?, ?, ?)';

    const params = [msg.taskId, msg.time, msg.component, msg.logLevel, msg.text];
    client.execute(query, params, {prepare: true}, onInsertLog)
};

const onInsertLog = (err) => {
    if (err)
        console.error('Log insertion failed:', err);
};