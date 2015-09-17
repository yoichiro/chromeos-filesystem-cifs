(function(Models, Types, Debug, Constants) {
    "use strict";

    // Constructor

    var SessionSetupResponse = function() {
        this.types_ = new Types();

        this.structureSize_ = 0;
        this.sessionFlags_ = 0;
        this.securityBlob_ = null;
    };

    // Public functions

    SessionSetupResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();

        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        this.sessionFlags_ = this.types_.getFixed2BytesValue(array, 2);
        
        var securityBlobOffset = this.types_.getFixed2BytesValue(array, 4);
        var securityBlobLength = this.types_.getFixed2BytesValue(array, 6);
        var pos = securityBlobOffset - Constants.SMB2_HEADER_SIZE;
        this.securityBlob_ = array.subarray(pos, pos + securityBlobLength);
    };

    SessionSetupResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };

    SessionSetupResponse.prototype.getSessionFlags = function() {
        return this.sessionFlags_;
    };

    SessionSetupResponse.prototype.getSecurityBlob = function() {
        return this.securityBlob_;
    };

    // Private functions

    // Export

    Models.SessionSetupResponse = SessionSetupResponse;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
