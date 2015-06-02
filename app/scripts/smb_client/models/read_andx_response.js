(function(Types, ResponseUtils) {
    "use strict";

    // Constructor

    var ReadAndxResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.available_ = null;
        this.dataCompactionMode_ = null;
        this.dataLength_ = null;

        this.data_ = null;
    };

    // Public functions

    ReadAndxResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        var next = this.responseUtils_.getOffsetSkippedAndxData();

        // Available
        this.available_ = this.types_.getFixed2BytesValue(array, next);
        next += 2;
        // Data Compaction Mode
        this.dataCompactionMode_ = this.types_.getFixed2BytesValue(array, next);
        next += 4;
        // Data Length
        this.dataLength_ = this.types_.getFixed2BytesValue(array, next);
        next += 2;
        // Data Offset
        var dataOffset = this.types_.getFixed2BytesValue(array, next);

        // Data
        this.data_ = array.subarray(dataOffset - 32,
                                    dataOffset + this.dataLength_);
    };

    ReadAndxResponse.prototype.getAvailable = function() {
        return this.available_;
    };

    ReadAndxResponse.prototype.getDataCompactionMode = function() {
        return this.dataCompactionMode_;
    };

    ReadAndxResponse.prototype.getDataLength = function() {
        return this.dataLength_;
    };

    // This returns the result as Uint8Array.
    ReadAndxResponse.prototype.getData = function() {
        return this.data_;
    };

    // Export

    SmbClient.ReadAndxResponse = ReadAndxResponse;

})(SmbClient.Types, SmbClient.ResponseUtils);
