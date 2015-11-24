(function(Models, Types, Constants, Debug) {
    "use strict";

    // Constructor

    var NegotiateRequest = function() {
        this.types_ = new Types();

        this.clientGuid_ = null;
    };

    // Public functions

    NegotiateRequest.prototype.createArrayBuffer = function() {
        var total = 36 + 4;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // StructureSize
        this.types_.setFixed2BytesValue(36, array, 0);
        // DialectCount
        this.types_.setFixed2BytesValue(2, array, 2);
        // SecurityMode
        this.types_.setFixed2BytesValue(0x01, array, 4);
        // Reserved(2)
        // Capabilities
        this.types_.setFixed4BytesValue(0, array, 8);
        // GUID
        this.types_.copyArray(this.clientGuid_, array, 12, 16);
        // ClientStartTime
        this.types_.setFixed8BytesValue(0, array, 28);
        // Dialect
        this.types_.setFixed2BytesValue(0x0202, array, 36);
        this.types_.setFixed2BytesValue(0x0210, array, 38);

        return buffer;
    };

    NegotiateRequest.prototype.getClientGuid = function() {
        return this.clientGuid_;
    };

    NegotiateRequest.prototype.setClientGuid = function(clientGuid) {
        this.clientGuid_ = clientGuid;
    };

    // Private functions

    // Export

    Models.NegotiateRequest = NegotiateRequest;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
