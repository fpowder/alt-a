var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//socketio redis adapter configuration
//웹소켓 세션을 redis에 저장
//redis기본 포트 6379
var socketIoRedis = require('socket.io-redis');
io.adapter(socketIoRedis({host: '127.0.0.1', port: 6379}));

//redis의 pub/sub 기능을 이용하여 실시간 db변경데이터를 웹서버로 전송
var redis = require('redis');
var subscriber = redis.createClient(6379, '127.0.0.1');
var cdcSocketIO = require('./cdcStream')(io, subscriber, process.pid);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));
var requestHandlers = require('./requestHandlers')(app, bodyParser);

console.log(__dirname);

app.set('views', __dirname + '/html');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

http.listen(8080, () => {
    console.log('server listening port 8080, pid : ' + process.pid);
});


