(function(Models, Types, Constants, Debug, ResponseUtils, File) {
    "use strict";
    
    // Constructor
    
    var QueryInfoResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();
        
        this.structureSize_ = null;
        this.file_ = null;
    };
    
    // Public functions
    
    QueryInfoResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        
        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        var offset = this.types_.getFixed2BytesValue(array, 2) - Constants.SMB2_HEADER_SIZE;

        var creationTime = this.responseUtils_.readSmbTime(array, offset);
        var lastAccessTime = this.responseUtils_.readSmbTime(array, offset + 8);
        var lastWriteTime = this.responseUtils_.readSmbTime(array, offset + 16);
        var changeTime = this.responseUtils_.readSmbTime(array, offset + 24);
        var fileAttributes = this.types_.getFixed4BytesValue(array, offset + 32);
        // UINT reserved
        var allocationSize = this.types_.getFixed8BytesValue(array, offset + 40);
        var endOfFile = this.types_.getFixed8BytesValue(array, offset + 48);
        var numberOfLinks = this.types_.getFixed4BytesValue(array, offset + 56);
        var deletePending = array[offset + 60];
        var directory = array[offset + 61];
        // USHORT reserved
        var fileId = this.types_.getFixed8BytesValue(array, offset + 64);
        var eaSize = this.types_.getFixed4BytesValue(array, offset + 72);
        var accessFlags = this.types_.getFixed4BytesValue(array, offset + 76);
        var currentByteOffset = this.types_.getFixed8BytesValue(array, offset + 80);
        var mode = this.types_.getFixed4BytesValue(array, offset + 88);
        var alignmentRequirement = this.types_.getFixed4BytesValue(array, offset + 92);
        var filenameLength = this.types_.getFixed4BytesValue(array, offset + 96);
        var filename = this.types_.getFixedLengthUnicodeString(array, offset + 100, filenameLength).result;
        
        this.file_ = new File();
        this.file_.setCreated(creationTime);
        this.file_.setLastAccess(lastAccessTime);
        this.file_.setWrite(lastWriteTime);
        this.file_.setChange(changeTime);
        this.file_.setFileAttributes(fileAttributes);
        this.file_.setAllocationSize(allocationSize);
        this.file_.setEndOfFile(endOfFile);
        this.file_.setFullFileName(filename);
    };
    
    QueryInfoResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };
    
    QueryInfoResponse.prototype.getFile = function() {
        return this.file_;
    };
    
    // Export
    
    Models.QueryInfoResponse = QueryInfoResponse;
    
})(SmbClient.Smb2.Models,
   SmbClient.Types,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb2.Models.ResponseUtils,
   SmbClient.File);
