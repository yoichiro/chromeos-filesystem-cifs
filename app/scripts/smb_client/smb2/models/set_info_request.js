(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var SetInfoRequest = function() {
        this.types_ = new Types();
        
        this.fileInfoClass_ = null;
        this.fileId_ = null;
    };
    
    // Public functions
    
    SetInfoRequest.prototype.createArrayBuffer = function() {
        var fileInfoClassBuffer = this.fileInfoClass_.createArrayBuffer(); // ArrayBuffer
        var fileInfoClassArray = new Uint8Array(fileInfoClassBuffer);
        
        var total = 32 + fileInfoClassArray.length;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(33, array, 0);
        // info_type
        array[2] = Constants.SMB2_0_INFO_FILE;
        // file_info_class
        array[3] = this.fileInfoClass_.getType();
        // buffer_length
        this.types_.setFixed4BytesValue(fileInfoClassArray.length, array, 4);
        // buffer_offset
        this.types_.setFixed2BytesValue(Constants.SMB2_HEADER_SIZE + 32, array, 8);
        // USHORT reserved
        // additional_information
        this.types_.setFixed4BytesValue(0, array, 12);
        // file_id
        this.types_.copyArray(this.fileId_, array, 16, 16);
        // buffer
        this.types_.copyArray(fileInfoClassArray, array, 32, fileInfoClassArray.length);
        
        return buffer;
    };
    
    SetInfoRequest.prototype.setFileInfoClass = function(fileInfoClass) {
        this.fileInfoClass_ = fileInfoClass;
    };
    
    SetInfoRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };
    
    // Export
    
    Models.SetInfoRequest = SetInfoRequest;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
