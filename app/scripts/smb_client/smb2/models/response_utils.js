(function(Models, Types, File) {
    "use strict";

    // Constructor

    var ResponseUtils = function() {
        this.types_ = new Types();
    };

    // Public functions

    ResponseUtils.prototype.readSmbTime = function(array, offset) {
        var low = this.types_.getFixed4BytesValue(array, offset);
        var high = this.types_.getFixed4BytesValue(array, offset + 4);
        return this.types_.getDateFromSmbTime(high, low);
    };

    // Export

    Models.ResponseUtils = ResponseUtils;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.File);
