"use strict";

var fs = require('fs');

var Channel = require('./Channel.js');

function makeStreamsToParent(fd){
    return {
        read: fs.createReadStream(undefined, {fd: fd}),
        write: fs.createWriteStream(undefined, {fd: fd})
    }
}

var parentStreams = makeStreamsToParent(3);

var c = new Channel(parentStreams.read, parentStreams.write);

c.on('message', function(msg){
    console.log('message from parent:', msg.length);
    
    if(msg.length >= Math.pow(2, 26))
        return;
    
    c.send(msg + msg);
});