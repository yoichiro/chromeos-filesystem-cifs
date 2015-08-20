(function(Models, Types, Constants, RequestUtils) {
    "use strict";

    // Constructor

    var CreateDirectoryRequest = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.directoryName_ = null;
    };

    // Public functions

    CreateDirectoryRequest.prototype.setDirectoryName = function(directoryName) {
        this.directoryName_ = directoryName;
    };

    CreateDirectoryRequest.prototype.createTransactionParameter = function() {
        var total =
                4 + // Reserved
                (this.directoryName_.length + 1) * 2; // Directory Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Directory Name
        this.types_.setUnicodeNullEndString(this.directoryName_, array, 4);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    CreateDirectoryRequest.prototype.createTransactionData = function() {
        return null;
    };

    CreateDirectoryRequest.prototype.createTransactionSetup = function() {
        return this.requestUtils_.createTransactionSetupSubCommandOnly(
            Constants.TRANS2_CREATE_DIRECTORY);
    };

    // Export

    Models.CreateDirectoryRequest = CreateDirectoryRequest;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Constants, SmbClient.RequestUtils);
