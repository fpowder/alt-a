var express = require('express');
var app = express();

//var cluster = require('cluster');
//var numCPUS = require('os').cpus().length;
//cluster.schedulingPolicy = cluster.SCHED_RR;  //error

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));

var requestHandlers = require('./requestHandlers')(app, bodyParser);

console.log(__dirname);

app.set('views', __dirname + '/html');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

app.listen(8080, () => {
    console.log('server listening port 8080, pid : ' + process.pid);
});

