(function(Models, Types, Constants, Debug) {
    "use strict";

    // Constructor

    var SessionSetupRequest = function() {
        this.types_ = new Types();

        this.flags_ = 0;
        this.securityMode_ = 1; // Signing Enabled
        this.capabilities_ = 1; // DFS
        this.channel_ = 0;
        this.previousSessionId_ = "";

        this.securityBlobOffset_ = null;
        this.securityBlobLength_ = null;
        this.securityBlob_ = null;
    };

    // Public functions

    /*jslint bitwise: true */
    SessionSetupRequest.prototype.load = function(negotiateResponse, options) {
        this.securityBlob_ = options.ntlmMessage.createArrayBuffer();
        this.securityBlobLength_ = this.securityBlob_.byteLength;
    };

    SessionSetupRequest.prototype.createArrayBuffer = function() {
        var total = 24 + this.securityBlobLength_;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // structure_size
        this.types_.setFixed2BytesValue(25, array, 0);
        // flags
        array[2] = 0;
        // security_mode
        array[3] = 1;
        // capabilities
        this.types_.setFixed4BytesValue(1, array, 4); // DFS
        // channel
        this.types_.setFixed4BytesValue(0, array, 8);
        // security_blog_offset
        this.types_.setFixed2BytesValue(64 + 24, array, 12);
        // security_blob_length
        this.types_.setFixed2BytesValue(this.securityBlobLength_, array, 14);
        // previous_session_id
        this.types_.setSimpleStringTo(this.previousSessionId_, array, 16, 8);
        // security_blob
        this.types_.copyArray(new Uint8Array(this.securityBlob_), array, 24, this.securityBlobLength_);
        
        return buffer;
    };

    // Export

    Models.SessionSetupRequest = SessionSetupRequest;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
