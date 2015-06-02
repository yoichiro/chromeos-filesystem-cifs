(function(Types) {
    "use strict";

    // Constructor

    var SeekRequest = function() {
        this.types_ = new Types();

        this.fid_ = null;
        this.offset_ = null;
    };

    // Public functions

    SeekRequest.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    SeekRequest.prototype.setOffset = function(offset) {
        this.offset_ = offset;
    };

    SeekRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(8);
        var array = new Uint8Array(buffer);

        // FID
        this.types_.setFixed2BytesValue(this.fid_, array, 0);
        // Mode (Seek from the start of the file.)
        this.types_.setFixed2BytesValue(0x0000, array, 2);
        // Offset
        this.types_.setFixedSigned4BytesValue(this.offset_, array, 4);

        return buffer;
    };

    SeekRequest.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    // Export

    SmbClient.SeekRequest = SeekRequest;

})(SmbClient.Types);
