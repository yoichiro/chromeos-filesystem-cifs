(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var QueryDirectoryInfoRequest = function() {
        this.types_ = new Types();
        
        this.fileId_ = null;
        this.flags_ = null;
    };
    
    // Public functions
    
    QueryDirectoryInfoRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };
    
    QueryDirectoryInfoRequest.prototype.setFlags = function(flags) {
        this.flags_ = flags;
    };
    
    QueryDirectoryInfoRequest.prototype.createArrayBuffer = function() {
        var total = 34;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(33, array, 0);
        // file_information_class
        array[2] = Constants.SMB2_0_FILE_ID_BOTH_DIRECTORY_INFORMATION;
        // flags
        array[3] = this.flags_;
        // file_index
        this.types_.setFixed4BytesValue(0, array, 4);
        // file_id
        this.types_.copyArray(this.fileId_, array, 8, 16);
        // filename_offset
        this.types_.setFixed2BytesValue(Constants.SMB2_HEADER_SIZE + 32, array, 24);
        // filename_length
        this.types_.setFixed2BytesValue(2, array, 26);
        // output_buffer_length
        this.types_.setFixed4BytesValue(65536, array, 28);
        // buffer
        this.types_.setUnicodeString("*", array, 32);
        
        return buffer;
    };
    
    // Export
    
    Models.QueryDirectoryInfoRequest = QueryDirectoryInfoRequest;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
