(function(Types, Constants) {
    "use strict";

    // Constructor

    var DeleteRequest = function() {
        this.types_ = new Types();

        this.fileName_ = null;
    };

    // Public functions

    DeleteRequest.prototype.setFileName = function(fileName) {
        this.fileName_ = fileName;
    };

    /*jslint bitwise: true */
    DeleteRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(2);
        var array = new Uint8Array(buffer);

        // Search Attributes
        var attributes =
                Constants.SMB_FILE_ATTRIBUTE_HIDDEN |
                Constants.SMB_FILE_ATTRIBUTE_SYSTEM;
        this.types_.setFixed2BytesValue(attributes, array, 0);

        return buffer;
    };

    DeleteRequest.prototype.createSmbDataArrayBuffer = function() {
        var total =
                1 + // Buffer Format
                (this.fileName_.length + 1) * 2; // File Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Buffer Format
        array[0] = 0x04;
        // File Name
        this.types_.setUnicodeNullEndString(this.fileName_, array, 1);

        return buffer;
    };

    // Export

    SmbClient.DeleteRequest = DeleteRequest;

})(SmbClient.Types, SmbClient.Constants);
