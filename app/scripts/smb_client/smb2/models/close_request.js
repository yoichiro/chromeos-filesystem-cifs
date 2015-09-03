(function(Models, Types) {
    "use strict";

    // Constructor

    var CloseRequest = function() {
        this.types_ = new Types();

        this.fid_ = null;
        this.flags_ = 0;
    };

    // Public functions

    CloseRequest.prototype.setFileId = function(fid) {
        this.fid_ = fid;
    };
    
    CloseRequest.prototype.setFlags = function(flags) {
        this.flags_ = flags;
    };

    CloseRequest.prototype.createArrayBuffer = function() {
        var buffer = new ArrayBuffer(24);
        var array = new Uint8Array(buffer);

        // structure_size
        this.types_.setFixed2BytesValue(24, array, 0);
        // flags
        this.types_.setFixed2BytesValue(this.flags_, array, 2);
        // UINT reserved
        // file_id
        this.types_.copyArray(this.fid_, array, 8, 16);

        return buffer;
    };

    // Export
    Models.CloseRequest = CloseRequest;

})(SmbClient.Smb2.Models, SmbClient.Types);
