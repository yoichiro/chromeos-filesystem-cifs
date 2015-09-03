(function(Models, Types, Debug, RequestUtils, Constants) {
    "use strict";

    // Constructor

    var FindNext2Request = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.lastFileName_ = null;
        this.searchCount_ = 200;
        this.searchId_ = null;
    };

    // Public functions

    FindNext2Request.prototype.setLastFileName = function(lastFileName) {
        this.lastFileName_ = lastFileName;
    };

    FindNext2Request.prototype.setSearchCount = function(searchCount) {
        this.searchCount_ = searchCount;
    };

    FindNext2Request.prototype.setSearchId = function(searchId) {
        this.searchId_ = searchId;
    };

    FindNext2Request.prototype.createTransactionParameter = function() {
        var total =
                12 +
                (this.lastFileName_.length + 1) * 2; // File Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Search ID
        this.types_.setFixed2BytesValue(this.searchId_, array, 0);
        // Search Count
        this.types_.setFixed2BytesValue(this.searchCount_, array, 2);
        // Information Level
        this.types_.setFixed2BytesValue(
            Constants.SMB_FIND_FILE_BOTH_DIRECTORY_INFO, array, 4);
        // Resume Key
        this.types_.setFixed4BytesValue(0, array, 6);
        // Flags
        this.types_.setFixed2BytesValue(0, array, 10);
        // File Name
        this.types_.setUnicodeNullEndString(this.lastFileName_, array, 12);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    FindNext2Request.prototype.createTransactionData = function() {
        return null;
    };

    FindNext2Request.prototype.createTransactionSetup = function() {
        return this.requestUtils_.createTransactionSetupSubCommandOnly(
            Constants.TRANS2_FIND_NEXT2);
    };

    // Export

    Models.FindNext2Request = FindNext2Request;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Smb1.Models.RequestUtils, SmbClient.Constants);
