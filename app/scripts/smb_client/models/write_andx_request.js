(function(Types, RequestUtils) {
    "use strict";

    // Constructor

    var WriteAndxRequest = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.fid_ = null;
        this.offset_ = null;
        this.data_ = null;
    };

    // Public functions

    WriteAndxRequest.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    WriteAndxRequest.prototype.setOffset = function(offset) {
        this.offset_ = offset;
    };

    // data: Uint8Array
    WriteAndxRequest.prototype.setData = function(data) {
        this.data_ = data;
    };

    WriteAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var total = 0x0e * 2; // 14 * 2
        var buffer = new ArrayBuffer(total);
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
        // Timeout
        this.types_.setFixed4BytesValue(0, array, 10);
        // WriteMode
        this.types_.setFixed2BytesValue(0, array, 14);
        // Remaining
        this.types_.setFixed2BytesValue(0, array, 16);
        // Data Length
        this.types_.setFixed2BytesValue(this.data_.length, array, 20);
        // Data Offset
        this.types_.setFixed2BytesValue(
                32 + // Header
                2 + // Word Count
                total + // Parameter
                1 + // Byte Count
                1, // Padding
            array, 22);
        // Offset High
        this.types_.setFixed4BytesValue(offsetInfo.high, array, 24);

        return buffer;
    };

    WriteAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        var total =
                1 + // Padding
                this.data_.length;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Data
        array.set(this.data_, 1);

        return buffer;
    };

    // Export

    SmbClient.WriteAndxRequest = WriteAndxRequest;

})(SmbClient.Types, SmbClient.RequestUtils);
