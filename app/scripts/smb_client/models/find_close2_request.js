(function(Types) {

    // Constructor

    var FindClose2Request = function() {
        this.types_ = new Types();

        this.searchId_ = null;
    };

    // Public functions

    FindClose2Request.prototype.setSearchId = function(searchId) {
        this.searchId_ = searchId;
    };

    FindClose2Request.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(2);
        var array = new Uint8Array(buffer);

        // Search ID
        this.types_.setFixed2BytesValue(this.searchId_, array, 0);

        return buffer;
    };

    FindClose2Request.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    // Export

    SmbClient.FindClose2Request = FindClose2Request;

})(SmbClient.Types);
