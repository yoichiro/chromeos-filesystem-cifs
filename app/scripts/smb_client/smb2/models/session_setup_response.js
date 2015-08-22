(function(Models, Types, Debug, Type2Message) {
    "use strict";

    // Constructor

    var SessionSetupResponse = function() {
        this.types_ = new Types();

        this.structureSize_ = 0;
        this.sessionFlags_ = 0;
        this.type2Message_ = null;
    };

    // Public functions

    SessionSetupResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        var header = packet.getHeader();
        
        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        this.sessionFlags_ = this.types_.getFixed2BytesValue(array, 2);
        
        var securityBlobOffset = this.types_.getFixed2BytesValue(array, 4);
        var securityBlobLength = this.types_.getFixed2BytesValue(array, 6);
        var securityBlob = array.subarray(securityBlobOffset - header.getStructureSize(), securityBlobLength);
        this.type2Message_ = new Type2Message();
        this.type2Message_.load(securityBlob);
        console.log(this);
    };

    SessionSetupResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };

    SessionSetupResponse.prototype.getSessionFlags = function() {
        return this.sessionFlags_;
    };

    SessionSetupResponse.prototype.getType2Message = function() {
        return this.type2Message_;
    };

    // Private functions

    // Export

    Models.SessionSetupResponse = SessionSetupResponse;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Auth.Type2Message);
