"use strict";

var spawn = require('child_process').spawn;
var Channel = require('../../Channel.js');

var child = spawn('node', [require.resolve('./child.js')], {
    // 4th pipe is for communication
    stdio: [0, 1, 2, 'pipe']
});

/*
child.stdio[3].on('data', function(d){
    console.log('from child', d.length);
});
child.stdio[3].on('close', function(){
    console.log('child closed')
});
child.stdio[3].on('end', function(){
    console.log('child ended')
});
child.stdio[3].on('error', function(err){
    console.log('child error', err)
});
*/

var c = new Channel(child.stdio[3], child.stdio[3]);

console.log('PARENT sending message');

c.send('a');

c.on('message', function listener(msg){    
    console.log('PARENT received', msg.length);

    if(msg.length >= Math.pow(2, 27)){
        console.log('the end');
        c.removeListener('message', listener)
        child.kill();
        process.kill();
    }

    console.log('PARENT received', msg.length*2);

    c.send(msg + msg);
});


