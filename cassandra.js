const cassandra = require('cassandra-driver');
const async = require('async');

const client = new cassandra.Client({
    contactPoints: ['192.168.0.166'],
    keyspace: 'logs'
});


exports.insertLog = (msg) => {
    client.execute(
        "INSERT INTO logs.testlogs (taskid, time, service, loglevel, text) ",
        )
};