var express = require('express');
//var app = express();
var server = require('http').createServer(express);

var io = require('socket.io').listen(3000, { transports: ['websocket', 'polling']});

//socketio redis adapter configuration
var socketIoRedis = require('socket.io-redis');
io.adapter(socketIoRedis({host: '127.0.0.1', port: 6379}));

var redis = require('redis');
var subscriber = redis.createClient(6379, '127.0.0.1');

//var cluster = require('cluster');
//var numCPUS = require('os').cpus().length;
//cluster.schedulingPolicy = cluster.SCHED_RR;  //error

/*
server.listen(socketIoPort, () => {
    console.log('http server for socket io listening port '+ socketIoPort +', pid : ' + process.pid);
});
*/

var cdcSocketIO = require('./cdcStream')(io, subscriber, process.pid);
//console.log('process.env.NODE_WORKER_ID : ' + process.pid);
    
