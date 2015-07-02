(function() {
    "use strict";

    // Constructor

    var BinaryUtils = function() {
        this.encoding_ = "utf-8";
    };

    // Public functions

    BinaryUtils.prototype.arrayBufferToString = function(buf) {
        var array = new Uint8Array(buf);
        var string = new TextDecoder(this.encoding_).decode(array);
        return string;
    };

    BinaryUtils.prototype.stringToArrayBuffer = function(str) {
        var array = new TextEncoder(this.encoding_).encode(str);
        var buffer = new ArrayBuffer(array.length);
        var dataView = new DataView(buffer);
        for (var i = 0; i < array.length; i++) {
            dataView.setInt8(i, array[i]);
        }
        return buffer;
    };

    BinaryUtils.prototype.createUint8Array = function(length) {
        var buffer = new ArrayBuffer(length);
        return new Uint8Array(buffer);
    };
    
    BinaryUtils.prototype.concatBuffers = function(buffers) {
        var total = 0;
        for (var i = 0; i < buffers.length; i++) {
            total += buffers[i].byteLength;
        }
        var newBuffer = new ArrayBuffer(total);
        var newArray = new Uint8Array(newBuffer);
        var pos = 0;
        var source;
        for (i = 0; i < buffers.length; i++) {
            source = new Uint8Array(buffers[i]);
            copyArray.call(this, source, newArray, pos);
            pos += source.length;
        }
        return newBuffer;
    };
    
    // Private functions
    
    var copyArray = function(source, target, offset) {
        for (var i = 0; i < source.length; i++) {
            target[i + offset] = source[i];
        }
    };

    // Export

    SmbClient.BinaryUtils = BinaryUtils;

})();
