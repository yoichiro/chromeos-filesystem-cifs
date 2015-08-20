(function(Models, Types, ResponseUtils, File) {
    "use strict";

    // Constructor

    var FindFirst2Response = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.searchId_ = null;
        this.searchCount_ = null;
        this.endOfSearch_ = null;
        this.lastNameOffset_ = null;
        this.files_ = null;
    };

    // Public functions

    FindFirst2Response.prototype.load = function(parameterArray, parameterOffset, dataArray, dataOffset) {
        loadParameters.call(this, parameterArray, parameterOffset);
        loadData.call(this, dataArray, dataOffset);
    };

    FindFirst2Response.prototype.getSearchId = function() {
        return this.searchId_;
    };

    FindFirst2Response.prototype.getSearchCount = function() {
        return this.searchCount_;
    };

    FindFirst2Response.prototype.getEndOfSearch = function() {
        return this.endOfSearch_;
    };

    FindFirst2Response.prototype.hasNext = function() {
        return this.endOfSearch_ === 0;
    };

    FindFirst2Response.prototype.getLastNameOffset = function() {
        return this.lastNameOffset_;
    };

    FindFirst2Response.prototype.getFiles = function() {
        return this.files_;
    };

    // Private functions

    var loadParameters = function(array, offset) {
        // Search ID
        this.searchId_ = this.types_.getFixed2BytesValue(array, 0);
        // Search Count
        this.searchCount_ = this.types_.getFixed2BytesValue(array, 2);
        // End Of Search
        this.endOfSearch_ = this.types_.getFixed2BytesValue(array, 4);
        // Last Name Offset
        this.lastNameOffset_ = this.types_.getFixed2BytesValue(array, 8);
    };

    var loadData = function(array, offset) {
        this.files_ = this.responseUtils_.loadData(array, offset, this.lastNameOffset_);
    };

    // Export

    Models.FindFirst2Response = FindFirst2Response;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.ResponseUtils, SmbClient.File);
