(function(Types, Constants, RequestUtils) {

    // Constructor

    var QueryPathInfoRequest = function() {
        this.types_ = new Types();
        this.requestUtils_ = new RequestUtils();

        this.fileName_ = null;
        this.levelOfInterest_ = Constants.SMB_QUERY_FILE_ALL_INFO;
    };

    // Public functions

    QueryPathInfoRequest.prototype.setFileName = function(fileName) {
        this.fileName_ = fileName;
    };

    /*
    QueryPathInfoRequest.prototype.setLevelOfInterest = function(levelOfInterest) {
        this.levelOfInterest_ = levelOfInterest;
    };
    */

    QueryPathInfoRequest.prototype.createTransactionParameter = function() {
        var total =
                2 + // Level of Interest
                4 + // Reserved
                (this.fileName_.length + 1) * 2; // File Name (Null terminated)
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        this.types_.setFixed2BytesValue(this.levelOfInterest_, array, 0);
        this.types_.setUnicodeNullEndString(this.fileName_, array, 6);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    QueryPathInfoRequest.prototype.createTransactionData = function() {
        return null;
    };

    QueryPathInfoRequest.prototype.createTransactionSetup = function() {
        return this.requestUtils_.createTransactionSetupSubCommandOnly(
            Constants.TRANS2_QUERY_PATH_INFORMATION);
    };

    // Export

    SmbClient.QueryPathInfoRequest = QueryPathInfoRequest;

})(SmbClient.Types, SmbClient.Constants, SmbClient.RequestUtils);
