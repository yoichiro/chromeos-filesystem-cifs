(function(Types, Constants, RequestUtils) {
    "use strict";

    // Constructor

    var ReadAndxRequest = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.fid_ = null;
        this.offset_ = null;
        this.length_ = null;
    };

    // Public functions

    ReadAndxRequest.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    ReadAndxRequest.prototype.setOffset = function(offset) {
        this.offset_ = offset;
    };

    ReadAndxRequest.prototype.setLength = function(length) {
        this.length_ = length;
    };

    ReadAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(24);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        // FID
        this.types_.setFixed2BytesValue(this.fid_, array, 4);
        // Offset Low
        var offsetInfo = this.types_.divide8BytesValue(this.offset_);
        this.types_.setFixed4BytesValue(offsetInfo.low, array, 6);
        // Max Count Of Bytes To Return
        this.types_.setFixed2BytesValue(
            Math.min(this.length_, Constants.READ_ANDX_BUFFER_SIZE), array, 10);
        // Min Count Of Bytes To Return
        this.types_.setFixed2BytesValue(
            Math.min(this.length_, Constants.READ_ANDX_BUFFER_SIZE), array, 12);
        // Timeout
        this.types_.setFixed4BytesValue(0, array, 14);
        // Remaining
        this.types_.setFixed2BytesValue(0, array, 18);
        // Offset High
        this.types_.setFixed4BytesValue(offsetInfo.high, array, 20);

        return buffer;
    };

    ReadAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    // Private functions

    // Export

    SmbClient.ReadAndxRequest = ReadAndxRequest;

})(SmbClient.Types, SmbClient.Constants, SmbClient.RequestUtils);
