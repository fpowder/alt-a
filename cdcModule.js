var redis = require('redis');
var publisher = redis.createClient(6379, '127.0.0.1');

var net = require('net');
var crypto = require('crypto');
var host = '127.0.0.1'; //192.168.1.101
var port = 4001;

//maxscale 계정정보(maxscale계정 생성 필요)
var user = 'maxuser'; 
var pwd = 'maxpwd';

//file => DATABASE.TABLE
var file = 'test.t1';
//Global Transaction ID
var gtid = '0-1-135';

//사용자 계정 비밀번호 암호화
var auth_string = Buffer.from(user + ":", 'utf-8').toString('hex');
auth_string += crypto.createHash('sha1').update(pwd).digest('hex');
console.log(auth_string);

var jsonBuffer = '';
var client = net.connect({port: port, host: host}, () => {  
    console.log('connect log ----------------------------------------');
    console.log('connect success');
    client.setEncoding('utf-8');
    client.setNoDelay(true);
    //client.setTimeout(120000); //2분

    client.on('close', () => {
        console.log('client Socket Close');
    }); 
    
    client.on('timeout', () => {
        console.log('connection timeout');
    });
    
    client.write(Buffer.from(auth_string, 'utf-8'), () => {
        client.once('data', (data) => {  //data = OK

            client.write(Buffer.from('REGISTER UUID=XXX-YYY_YYY, TYPE=JSON', 'utf-8'), () => {
                client.once('data', (data) => {  //data = OK

                    client.write(Buffer.from('REQUEST-DATA ' + file + ' ' + gtid, 'utf-8'), () => {  //data request
                        client.on('data', (data) => {

                            //maxscale에서 보낸 데이터를 json단위로 자른다.
                            var dataString = data.toString();
                            jsonBuffer += dataString;
                            var jsonString = jsonBuffer.slice(0, jsonBuffer.lastIndexOf('}') + 1)
                            jsonBuffer = jsonBuffer.slice(jsonBuffer.lastIndexOf('}') + 1, jsonBuffer.length);

                            var dataArray = jsonString.split('\n');
                            var returnData = new Array();
                            for(i = 0; i < dataArray.length ; i++){

                                //jsonArray.push(JSON.parse(dataArray[i]));
                                if(dataArray[i] != '' || Object.entries(dataArray[i]).length != 0){
                                    //dataArray[i] = JSON.parse(dataArray[i]);
                                    returnData.push(JSON.parse(dataArray[i]));
                                }

                            } //for
                            var result = JSON.stringify({cdcData : returnData});

                            //redis로 publish
                            publisher.PUBLISH('cdcRedis', result);
                            
                        });
                    }); 

                });
            });

        });
    });
}); //client

