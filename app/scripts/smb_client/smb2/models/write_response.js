(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var WriteResponse = function() {
        this.types_ = new Types();
        
        this.count_ = null;
        this.remaining_ = null;
    };
    
    // Public functions
    
    WriteResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        
        var structureSize = this.types_.getFixed2BytesValue(array, 0);
        // USHORT reserved
        this.count_ = this.types_.getFixed4BytesValue(array, 4);
        this.remaining_ = this.types_.getFixed4BytesValue(array, 8);
        var writeChannelInfoOffset = this.types_.getFixed2BytesValue(array, 12);
        var writeChannelInfoLength = this.types_.getFixed2BytesValue(array, 14);
    };
    
    WriteResponse.prototype.getCount = function() {
        return this.count_;
    };
    
    WriteResponse.prototype.getRemaining = function() {
        return this.remaining_;
    };
    
    // Export
    
    Models.WriteResponse = WriteResponse;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
