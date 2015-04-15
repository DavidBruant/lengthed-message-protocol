"use strict";

var util = require("util");
var events = require("events");

/*
    Create a channel object from read+write stream.
    A channel is an object with a .send method and an event emitter emitting 'message' events.
    messages are sent as | length (4 bytes) | content (length bytes) |
*/

function Channel(readStream, writeStream){
    if(!writeStream)
        throw new TypeError('missing writeStream');
    if(!readStream)
        throw new TypeError('missing readStream');
    
    if(!this)
        return new Channel(readStream, writeStream)
    
    var self = this;
        
    /*
        SENDING
    */
    this.send = function(str){
        var sizeFragment = new Buffer(4);
        var strFragment = new Buffer(str);
            
        sizeFragment.writeUInt32LE(strFragment.length, 0, 4);
        
        var b = Buffer.concat([sizeFragment, strFragment]);
        
        writeStream.write(b);
    };
    
    
    /*
        RECEIVING
    */
    var partialLengthBuffer;
    var currentMessageLength;
    
    var partialMessageContent;
    
    function accumulateLength(chunk){
        if(currentMessageLength)
            throw new Error('currentMessageLength already done');
        
        partialLengthBuffer = partialLengthBuffer ?
            Buffer.concat([partialLengthBuffer, chunk]) :
            chunk;
    }
    
    function accumulateContent(chunk){
        partialMessageContent = partialMessageContent ?
            Buffer.concat([partialMessageContent, chunk]) :
            chunk;
    }
    
    
    function processChunk(chunk){
        var lengthPart;
        var contentPart;
        
        var contentFirstIndex = 0;
                
        if(!currentMessageLength){
            contentFirstIndex = partialLengthBuffer ? 4 - partialLengthBuffer.length : 4;
            accumulateLength(chunk.slice(0, contentFirstIndex));
        
            if(partialLengthBuffer.length === 4){
                currentMessageLength = partialLengthBuffer.readUInt32LE(0, 4);
                partialLengthBuffer = undefined;
            }
        }
            
        var contentLastIndex;
        // side effects may have changed the value
        if(currentMessageLength){
            contentLastIndex = partialMessageContent ?
                contentFirstIndex + currentMessageLength - partialMessageContent.length :
                contentFirstIndex + currentMessageLength;
            
            accumulateContent(chunk.slice(contentFirstIndex, contentLastIndex));
                    
            if(partialMessageContent.length === currentMessageLength){ // message complete
                self.emit('message', partialMessageContent.toString());
                currentMessageLength = undefined;
                partialMessageContent = undefined;
                            
                var leftoverChunk = chunk.slice(contentLastIndex);
                if(leftoverChunk.length >= 1)
                    processChunk(leftoverChunk);
            }
        }
    }
    
    
    readStream.on('data', processChunk);
};

util.inherits(Channel, events.EventEmitter);

module.exports = Channel;
