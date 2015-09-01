(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var ReadResponse = function() {
        this.types_ = new Types();
        
        this.data_ = null;
        this.dataRemaining_ = null;
        this.dataLength_ = null;
    };
    
    // Public functions
    
    ReadResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        
        var structureSize = this.types_.getFixed2BytesValue(array, 0);
        var dataOffset = array[2];
        // UCHAR reserved
        this.dataLength_ = this.types_.getFixed4BytesValue(array, 4);
        this.dataRemaining_ = this.types_.getFixed4BytesValue(array, 8);
        // UINT reserved
        var pos = dataOffset - Constants.SMB2_HEADER_SIZE;
        this.data_ = array.subarray(pos, pos + this.dataLength_);
    };
    
    ReadResponse.prototype.getDataLength = function() {
        return this.dataLength_;
    };

    // This returns the result as Uint8Array.
    ReadResponse.prototype.getData = function() {
        return this.data_;
    };

    // Export
    
    Models.ReadResponse = ReadResponse;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);