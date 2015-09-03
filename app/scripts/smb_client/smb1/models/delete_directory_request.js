(function(Models, Types, Constants) {
    "use strict";

    // Constructor

    var DeleteDirectoryRequest = function() {
        this.types_ = new Types();

        this.directoryName_ = null;
    };

    // Public functions

    DeleteDirectoryRequest.prototype.setDirectoryName = function(directoryName) {
        this.directoryName_ = directoryName;
    };

    DeleteDirectoryRequest.prototype.createSmbParametersArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    DeleteDirectoryRequest.prototype.createSmbDataArrayBuffer = function() {
        var total =
                1 + // Buffer Format
                (this.directoryName_.length + 1) * 2; // Directory Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Buffer Format
        array[0] = 0x04;
        // File Name
        this.types_.setUnicodeNullEndString(this.directoryName_, array, 1);

        return buffer;
    };

    // Export

    Models.DeleteDirectoryRequest = DeleteDirectoryRequest;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Constants);
