module.exports = (io, subscriber, pid) => {

    io.on('connection', (socket) => {
        console.log('client connected..');

        //redis의 cdc이벤트를 구독해놓음
        subscriber.subscribe('cdcRedis');
        subscriber.on('message', (channel, message) => {
            console.log('message from channel : '+channel);

            /*redis의 cdcRedis이벤트를 구독을 통해 데이터가 전송되면
            * 이를 다시 socket.io의 cdc이벤트를 통해 웹브라우져클라이언트로 전송
            */
            socket.emit('cdc', {data : message, pid : pid});

        });
        
        socket.on('disconnect', () => {

        });
    
    //socket.io room기능 (cluster테스트용)
 	socket.join('room');	
	socket.on('broadcast', (msg) => {
		io.to('room').emit('roomEvent', msg);
	});
	
    });
    
};
