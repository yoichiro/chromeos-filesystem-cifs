(function(Types, Debug, RequestUtils, Constants) {
    "use strict";

    // Constructor

    var FindFirst2Request = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.directoryName_ = null;
        this.searchCount_ = 200;
    };

    // Public functions

    FindFirst2Request.prototype.setDirectoryName = function(directoryName) {
        this.directoryName_ = directoryName;
    };

    FindFirst2Request.prototype.setSearchCount = function(searchCount) {
        this.searchCount_ = searchCount;
    };

    /*jslint bitwise: true */
    FindFirst2Request.prototype.createTransactionParameter = function() {
        var fileName = this.directoryName_ + "\\*";
        var total =
                12 +
                (fileName.length + 1) * 2; // File Name
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Search Attributes
        this.types_.setFixed2BytesValue(
            Constants.SMB_FILE_ATTRIBUTE_HIDDEN |
            Constants.SMB_FILE_ATTRIBUTE_SYSTEM |
            Constants.SMB_FILE_ATTRIBUTE_DIRECTORY,
            array, 0);
        // Search Count
        this.types_.setFixed2BytesValue(this.searchCount_, array, 2);
        // Flags
        this.types_.setFixed2BytesValue(0, array, 4);
        // Information Level
        this.types_.setFixed2BytesValue(
            Constants.SMB_FIND_FILE_BOTH_DIRECTORY_INFO, array, 6);
        // Search Storage Type
        this.types_.setFixed4BytesValue(0, array, 8);
        // File Name
        this.types_.setUnicodeNullEndString(fileName, array, 12);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    FindFirst2Request.prototype.createTransactionData = function() {
        return null;
    };

    FindFirst2Request.prototype.createTransactionSetup = function() {
        return this.requestUtils_.createTransactionSetupSubCommandOnly(
            Constants.TRANS2_FIND_FIRST2);
    };

    // Export

    SmbClient.FindFirst2Request = FindFirst2Request;

})(SmbClient.Types, SmbClient.Debug, SmbClient.RequestUtils, SmbClient.Constants);
