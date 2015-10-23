(function(Models, Types, Constants, Debug, ResponseUtils, File) {
    "use strict";
    
    // Constructor
    
    var QueryInfoResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();
        
        this.structureSize_ = null;
        this.result_ = null;
    };
    
    // Public functions
    
    QueryInfoResponse.prototype.load = function(packet, fileInfoClass) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        
        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        var offset = this.types_.getFixed2BytesValue(array, 2) - Constants.SMB2_HEADER_SIZE;
        
        this.result_ = {};
        
        if (fileInfoClass === Constants.SMB2_0_FILE_BASIC_INFORMATION) {
            this.result_.creationTime = this.responseUtils_.readSmbTime(array, offset);
            this.result_.lastAccessTime = this.responseUtils_.readSmbTime(array, offset + 8);
            this.result_.lastWriteTime = this.responseUtils_.readSmbTime(array, offset + 16);
            this.result_.changeTime = this.responseUtils_.readSmbTime(array, offset + 24);
            this.result_.fileAttributes = this.types_.getFixed4BytesValue(array, offset + 32);
        } else if (fileInfoClass === Constants.SMB2_0_FILE_STANDARD_INFORMATION) {
            this.result_.allocationSize = this.types_.getFixed8BytesValue(array, offset);
            this.result_.endOfFile = this.types_.getFixed8BytesValue(array, offset + 8);
        }
    };
    
    QueryInfoResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };
    
    QueryInfoResponse.prototype.getResult = function() {
        return this.result_;
    };
    
    // Export
    
    Models.QueryInfoResponse = QueryInfoResponse;
    
})(SmbClient.Smb2.Models,
   SmbClient.Types,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb2.Models.ResponseUtils,
   SmbClient.File);
