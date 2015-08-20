(function(Models, Types) {
    "use strict";

    // Constructor

    var TreeConnectAndxRequest = function() {
        this.types_ = new Types();

        this.path_ = null;
        this.service_ = null;
    };

    // Public functions

    TreeConnectAndxRequest.prototype.setPath = function(path) {
        this.path_ = path;
    };

    TreeConnectAndxRequest.prototype.setService = function(service) {
        this.service_ = service;
    };

    TreeConnectAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(8);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        this.types_.setFixed2BytesValue(0, array, 4);
        this.types_.setFixed2BytesValue(1, array, 6);

        return buffer;
    };

    TreeConnectAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        var total = 1 + (this.path_.length + 1) * 2 + this.service_.length + 1;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        array[0] = 0x00; // Null terminate for Password.
        var offset = this.types_.setUnicodeNullEndString(this.path_, array, 1);
        this.types_.setSimpleNullEndStringTo(this.service_, array, offset);

        return buffer;
    };

    // Export

    Models.TreeConnectAndxRequest = TreeConnectAndxRequest;

})(SmbClient.Smb1.Models, SmbClient.Types);
