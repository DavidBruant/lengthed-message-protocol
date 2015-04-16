# lengthed-message-protocol

Async message-passing protocol based on streams

## Motivation

There is apparently no simple async IPC protocol in Node.

Options are:
* [process.send() + message event](https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle). 
  * According to the doc "Please note that the send() method on both the parent and child are synchronous - sending large chunks of data is not advised (pipes can be used instead, see child_process.spawn).". Empirically it also looks that when 4 children processes communicating with the parent require a lot of synchronization with the parent making it and the children not so useful any longer (wasting their time waiting for the other process to synchronize instead of doing actual work)
* Redis pub/sub
  * Imposing Redis to do IPC seems overkill
* [line-terminated protocols](https://github.com/pgte/carrier)
  * A one-byte value needs to be reserved to be used as separator, this prevents sending message with data from untrusted sources (like data gathered from crawling the web which really can be any byte sequence) or requires escaping, etc.

## API

````js
var Channel = require('lengthed-message-protocol');

// example of how to get read/write streams for IPC
var spawn = require('child_process').spawn;
var child = spawn('node', [require.resolve('./child.js')], {
    stdio: [0, 1, 2, 'pipe'] // 4th pipe is for communication
});

var c = new Channel(child.stdio[3], child.stdio[3]);

c.send("ping");

c.on("message", function(msg){
  console.log('message received from child', msg)
});
````

## Protocol details

Messages are sent as `| length (4 bytes) | content (length bytes) |`
The protocol is taken care of transparently from the streams

A 4-bytes length imposes a limitation of messages smaller than 2<sup>32</sup>-1 bytes... but that's already a big message even to hold in memory. Create another protocol if you want bigger messages :-)
