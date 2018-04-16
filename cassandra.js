const cassandra = require('cassandra-driver');
const async = require('async');
const path = require('path');
const fs = require('fs');

let client = null;
let tableName = null;
let clientReady = true;
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

const onNewClient = (err) => {
    if (err) {
        console.error('Failed to connect to a database:'+  err);
        clientReady = false;
        return
    }
    console.log('Connection established with Cassandra!');

};

const onInsertLog = (err) => {
    if (err) {
        console.error('Log inserttion failed:', err);
        return;
    }
    console.log('Log inserted successfully!');
};