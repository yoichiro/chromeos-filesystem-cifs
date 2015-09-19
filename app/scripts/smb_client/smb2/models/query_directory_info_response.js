(function(Models, Types, Constants, Debug, File) {
    "use strict";
    
    // Constructor
    
    var QueryDirectoryInfoResponse = function() {
        this.types_ = new Types();
        
        this.structureSize_ = null;
        this.files_ = [];
    };
    
    // Public functions
    
    QueryDirectoryInfoResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();
        
        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        var outputBufferOffset = this.types_.getFixed2BytesValue(array, 2);
        var outputBufferLength = this.types_.getFixed4BytesValue(array, 4);
        
        if (outputBufferLength > 0) {
            var pos = outputBufferOffset - Constants.SMB2_HEADER_SIZE;
            
            while (true) {
                var nextEntryOffset = this.types_.getFixed4BytesValue(array, pos);
                var fileIndex = this.types_.getFixed4BytesValue(array, pos + 4);
                var creationTime = this.types_.getDateFromArray(array, pos + 8);
                var lastAccessTime = this.types_.getDateFromArray(array, pos + 16);
                var lastWriteTime = this.types_.getDateFromArray(array, pos + 24);
                var changeTime = this.types_.getDateFromArray(array, pos + 32);
                var endOfFile = this.types_.getFixed8BytesValue(array, pos + 40);
                var allocationSize = this.types_.getFixed8BytesValue(array, pos + 48);
                var fileAttributes = this.types_.getFixed4BytesValue(array, pos + 56);
                var filenameLength = this.types_.getFixed4BytesValue(array, pos + 60);
                var eaSize = this.types_.getFixed4BytesValue(array, pos + 64);
                var shortNameLength = array[pos + 68];
                // UCHAR reserved
                var shortName = this.types_.getFixedLengthUnicodeString(array, pos + 70, shortNameLength).result;
                // USHORT reserved
                var fileId = this.types_.getFixed8BytesValue(array, pos + 96);
                var filename = this.types_.getFixedLengthUnicodeString(array, pos + 104, filenameLength).result;
                
                var file = new File();
                file.setCreated(creationTime);
                file.setLastAccess(lastAccessTime);
                file.setWrite(lastWriteTime);
                file.setChange(changeTime);
                file.setFileAttributes(fileAttributes);
                file.setAllocationSize(allocationSize);
                file.setEndOfFile(endOfFile);
                file.setFileName(filename);
                if (!file.isFileAttributesOf(Constants.SMB2_FILE_ATTRIBUTE_HIDDEN) &&
                    !file.isFileAttributesOf(Constants.SMB2_FILE_ATTRIBUTE_SYSTEM)) {
                    this.files_.push(file);
                }
                
                if (nextEntryOffset === 0) {
                    break;
                } else {
                    pos += nextEntryOffset;
                }
            }
        }
    };
    
    QueryDirectoryInfoResponse.prototype.getFiles = function() {
        return this.files_;
    };
    
    // Export
    
    Models.QueryDirectoryInfoResponse = QueryDirectoryInfoResponse;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug, SmbClient.File);
