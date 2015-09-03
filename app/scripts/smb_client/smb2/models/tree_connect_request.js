(function(Models, Types, Constants) {
    "use strict";

    // Constructor

    var TreeConnectRequest = function() {
        this.types_ = new Types();

        this.path_ = null;
    };

    // Public functions

    TreeConnectRequest.prototype.setPath = function(path) {
        this.path_ = path;
    };

    TreeConnectRequest.prototype.createArrayBuffer = function() {
        var total = 8 + (this.path_.length * 2);
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // structure_size
        this.types_.setFixed2BytesValue(9, array, 0);
        // reserved
        this.types_.setFixed2BytesValue(0, array, 2);
        // path_offset
        this.types_.setFixed2BytesValue(Constants.SMB2_HEADER_SIZE + 8, array, 4);
        // path_length
        this.types_.setFixed2BytesValue(this.path_.length * 2, array, 6);
        // buffer
        this.types_.setUnicodeString(this.path_, array, 8);

        return buffer;
    };

    // Export

    Models.TreeConnectRequest = TreeConnectRequest;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants);
