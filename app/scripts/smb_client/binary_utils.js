(function() {
    "use strict";

    // Constructor

    var BinaryUtils = function() {
        this.encoding_ = "utf-8";
    };

    // Public methods

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

    // Export

    SmbClient.BinaryUtils = BinaryUtils;

})();
