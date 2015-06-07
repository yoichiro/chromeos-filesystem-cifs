(function(Types, Constants) {
    "use strict";

    // Constructor

    var RenameRequest = function() {
        this.types_ = new Types();

        this.oldFileName_ = null;
        this.newFileName_ = null;
    };

    // Public functions

    RenameRequest.prototype.setOldFileName = function(oldFileName) {
        this.oldFileName_ = oldFileName;
    };

    RenameRequest.prototype.setNewFileName = function(newFileName) {
        this.newFileName_ = newFileName;
    };

    /*jslint bitwise: true */
    RenameRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(2);
        var array = new Uint8Array(buffer);

        // Search Attributes
        var attributes =
                Constants.SMB_FILE_ATTRIBUTE_HIDDEN |
                Constants.SMB_FILE_ATTRIBUTE_SYSTEM;
        this.types_.setFixed2BytesValue(attributes, array, 0);

        return buffer;
    };

    RenameRequest.prototype.createSmbDataArrayBuffer = function() {
        var padding = this.types_.getPaddingLength(
                32 + // SMB Header
                2 + // Word Count
                2 + // Parameters
                1 + // Byte Count
                1 + // Buffer Format 1
                (this.oldFileName_.length + 1) * 2 + // Olf File Name
                1, // Buffer Format 2
            2);
        var total =
                1 + // Buffer Format 1
                (this.oldFileName_.length + 1) * 2 + // Old File Name
                1 + // Buffer Format 2
                padding + // Padding
                (this.newFileName_.length + 1) * 2; // New File Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Buffer Format 1
        array[0] = 0x04;
        // Old File Name
        var next = this.types_.setUnicodeNullEndString(this.oldFileName_, array, 1);
        // Buffer Format 2
        array[next] = 0x04;
        next += 1 + padding;
        // New File Name
        this.types_.setUnicodeNullEndString(this.newFileName_, array, next);

        return buffer;
    };

    // Export
    SmbClient.RenameRequest = RenameRequest;

})(SmbClient.Types, SmbClient.Constants);
