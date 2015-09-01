(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var ReadRequest = function() {
        this.types_ = new Types();
        
        this.length_ = null;
        this.offset_ = null;
        this.fileId_ = null;
    };
    
    // Public functions
    
    ReadRequest.prototype.createArrayBuffer = function() {
        var total = 49;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(49, array, 0);
        // padding
        array[2] = 0;
        // flags
        array[3] = 0;
        // length
        this.types_.setFixed4BytesValue(this.length_, array, 4);
        // offset
        this.types_.setFixed8BytesValue(this.offset_, array, 8);
        // file_id
        this.types_.copyArray(this.fileId_, array, 16, 16);
        // minimum_count
        this.types_.setFixed4BytesValue(Constants.SMB2_READ_BUFFER_SIZE, array, 32);
        // channel
        this.types_.setFixed4BytesValue(0, array, 36);
        // remaining_bytes
        this.types_.setFixed4BytesValue(0, array, 40);
        // read_channel_info_offset
        this.types_.setFixed2BytesValue(0, array, 44);
        // read_channel_info_length
        this.types_.setFixed2BytesValue(0, array, 46);
        // buffer
        array[48] = 0;
        
        return buffer;
    };
    
    ReadRequest.prototype.setLength = function(length) {
        this.length_ = length;
    };
    
    ReadRequest.prototype.setOffset = function(offset) {
        this.offset_ = offset;
    };
    
    ReadRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };
    
    // Export
    
    Models.ReadRequest = ReadRequest;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);