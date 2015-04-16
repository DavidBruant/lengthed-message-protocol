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
}

c.send(JSON.stringify(o));

c.on('message', function(msg){    
    var m = JSON.parse(msg);
    
    console.log(m.a === o.a+1 && m.b === o.b+1);
});
