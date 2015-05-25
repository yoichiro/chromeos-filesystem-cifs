(function(Types, ResponseUtils, File) {

    // Constructor

    var FindNext2Response = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.searchCount_ = null;
        this.endOfSearch_ = null;
        this.lastNameOffset_ = null;
        this.files_ = null;
    };

    // Public functions

    FindNext2Response.prototype.load = function(parameterArray, parameterOffset, dataArray, dataOffset) {
        loadParameters.call(this, parameterArray, parameterOffset);
        loadData.call(this, dataArray, dataOffset);
    };

    FindNext2Response.prototype.getSearchCount = function() {
        return this.searchCount_;
    };

    FindNext2Response.prototype.getEndOfSearch = function() {
        return this.endOfSearch_;
    };

    FindNext2Response.prototype.hasNext = function() {
        return this.endOfSearch_ === 0;
    };

    FindNext2Response.prototype.getLastNameOffset = function() {
        return this.lastNameOffset_;
    };

    FindNext2Response.prototype.getFiles = function() {
        return this.files_;
    };

    // Private functions

    var loadParameters = function(array, offset) {
        // Search Count
        this.searchCount_ = this.types_.getFixed2BytesValue(array, 0);
        // End Of Search
        this.endOfSearch_ = this.types_.getFixed2BytesValue(array, 2);
        // Last Name Offset
        this.lastNameOffset_ = this.types_.getFixed2BytesValue(array, 6);
    };

    var loadData = function(array, offset) {
        this.files_ = this.responseUtils_.loadData(array, offset, this.lastNameOffset_);
    };

    // Export

    SmbClient.FindNext2Response = FindNext2Response;

})(SmbClient.Types, SmbClient.ResponseUtils, SmbClient.File);
