(function(Models, Types, ResponseUtils) {

    "use strict";

    // Constructor

    var WriteAndxResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.count_ = null;
        this.available_ = null;
    };

    // Public functions

    WriteAndxResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbParametersAndSmbDataUint8Array();

        var next = this.responseUtils_.getOffsetSkippedAndxData();

        // Count
        this.count_ = this.types_.getFixed2BytesValue(array, next);
        next += 2;

        // Available
        this.available_ = this.types_.getFixed2BytesValue(array, next);
    };

    WriteAndxResponse.prototype.getCount = function() {
        return this.count_;
    };

    WriteAndxResponse.prototype.getAvailable = function() {
        return this.available_;
    };

    // Export

    Models.WriteAndxResponse = WriteAndxResponse;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Smb1.Models.ResponseUtils);
