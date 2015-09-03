(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var WriteRequest = function() {
        this.types_ = new Types();
        
        this.fileId_ = null;
        this.offset_ = null;
        this.data_ = null; // Uint8Array
    };
    
    WriteRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };

    WriteRequest.prototype.setOffset = function(offset) {
        this.offset_ = offset;
    };
    
    WriteRequest.prototype.setData = function(data) {
        this.data_ = data;
    };
    
    WriteRequest.prototype.createArrayBuffer = function() {
        var total = 48 + this.data_.length;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(49, array, 0);
        // data_offset
        this.types_.setFixed2BytesValue(Constants.SMB2_HEADER_SIZE + 48, array, 2);
        // length
        this.types_.setFixed4BytesValue(this.data_.length, array, 4);
        // offset
        this.types_.setFixed8BytesValue(this.offset_, array, 8);
        // file_id
        this.types_.copyArray(this.fileId_, array, 16, 16);
        // channel
        this.types_.setFixed4BytesValue(0, array, 32);
        // remaining_bytes
        this.types_.setFixed4BytesValue(0, array, 36);
        // write_channel_info_offset
        this.types_.setFixed2BytesValue(0, array, 40);
        // write_channel_info_length
        this.types_.setFixed2BytesValue(0, array, 42);
        // flags
        this.types_.setFixed4BytesValue(0, array, 44);
        // buffer
        this.types_.copyArray(this.data_, array, 48, this.data_.length);
        
        return buffer;
    };


    // Export
    
    Models.WriteRequest = WriteRequest;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
