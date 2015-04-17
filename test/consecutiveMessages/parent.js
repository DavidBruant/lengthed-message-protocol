"use strict";

var spawn = require('child_process').spawn;
var Channel = require('../../Channel.js');

var child = spawn('node', [require.resolve('./child.js')], {
    // 4th pipe is for communication
    stdio: [0, 1, 2, 'pipe']
});

var c = new Channel(child.stdio[3], child.stdio[3]);

var o = {
    a: 1, 
    b: 2
};

var NB = 1000;

for(var i = 0; i < NB; i++){
    var msg = JSON.stringify(o);
    //console.log('PARENT sending', msg.length);
    c.send(msg);
}

var receivedMessage = 0;

c.on('message', function listener(msg){
    //console.log('PARENT received', msg.length);
    receivedMessage++;
});


setTimeout(function(){
    if(receivedMessage === NB)
        console.log('passed')
    else
        console.log('fail', receivedMessage, NB);
}, 2*1000);