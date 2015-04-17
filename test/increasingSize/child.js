"use strict";

console.log('child up!');

var fs = require('fs');

var Channel = require('../../Channel.js');

function makeStreamsToParent(fd){
    return {
        read: fs.createReadStream(undefined, {fd: fd}),
        write: fs.createWriteStream(undefined, {fd: fd})
    }
}

var parentStreams = makeStreamsToParent(3);

var c = new Channel(parentStreams.read, parentStreams.write);

c.on('message', function(msg){
    var str = msg.toString();
    
    console.log('CHILD receiving', msg.length);
    
    console.log('CHILD sending', msg.length*2);
    c.send(msg + msg);
});
