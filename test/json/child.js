"use strict";

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
    var m = JSON.parse(msg.toString());
    m.a++;
    m.b++;
    
    c.send(JSON.stringify(m));
});