(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var QueryInfoRequest = function() {
        this.types_ = new Types();
        
        this.fileId_ = null;
        this.fileInfoClass_ = null;
    };
    
    // Public functions
    
    QueryInfoRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };
    
    QueryInfoRequest.prototype.setFileInfoClass = function(fileInfoClass) {
        this.fileInfoClass_ = fileInfoClass;
    };
    
    QueryInfoRequest.prototype.createArrayBuffer = function() {
        var total = 40;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(41, array, 0);
        // info_type
        array[2] = Constants.SMB2_0_INFO_FILE;
        // file_info_class
        array[3] = this.fileInfoClass_;
        // output_buffer_length
        this.types_.setFixed4BytesValue(1124, array, 4);
        // input_buffer_offset
        this.types_.setFixed2BytesValue(0, array, 8);
        // USHORT reserved
        this.types_.setFixed2BytesValue(0, array, 10);
        // input_buffer_length
        this.types_.setFixed4BytesValue(0, array, 12);
        // additional_information
        this.types_.setFixed4BytesValue(0, array, 16);
        // flags
        this.types_.setFixed4BytesValue(0, array, 20);
        // file_id
        this.types_.copyArray(this.fileId_, array, 24, 16);
        
        return buffer;
    };
    
    // Export
    
    Models.QueryInfoRequest = QueryInfoRequest;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
