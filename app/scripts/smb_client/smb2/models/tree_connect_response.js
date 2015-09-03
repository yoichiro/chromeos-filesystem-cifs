(function(Models, Types) {
    "use strict";

    // Constructor

    var TreeConnectResponse = function() {
        this.types_ = new Types();
        
        this.structureSize_ = null;
        this.shareType_ = null;
        this.shareFlags_ = null;
        this.capabilities_ = null;
        this.maximalAccess_ = null;
    };

    // Public functions

    /*jslint bitwise: true */
    TreeConnectResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();

        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        this.shareType_ = array[2];
        // Reserved (1 byte)
        this.shareFlags_ = this.types_.getFixed4BytesValue(array, 4);
        this.capabilities_ = this.types_.getFixed4BytesValue(array, 8);
        this.maximalAccess_ = this.types_.getFixed4BytesValue(array, 12);
    };
    
    TreeConnectResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };

    TreeConnectResponse.prototype.getShareType = function() {
        return this.shareType_;
    };

    TreeConnectResponse.prototype.getShareFlags = function() {
        return this.shareFlags_;
    };

    TreeConnectResponse.prototype.getCapabilities = function() {
        return this.capabilities_;
    };

    TreeConnectResponse.prototype.getMaximalAccess = function() {
        return this.maximalAccess_;
    };

    // Export

    Models.TreeConnectResponse = TreeConnectResponse;

})(SmbClient.Smb2.Models, SmbClient.Types);
