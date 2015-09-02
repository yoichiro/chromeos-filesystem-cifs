(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var FileRenameInformation = function() {
        this.types_ = new Types();
        
        this.filename_ = null;
    };
    
    // Public functions
    
    FileRenameInformation.prototype.getType = function() {
        return Constants.SMB2_0_FILE_RENAME_INFORMATION;
    };
    
    FileRenameInformation.prototype.createArrayBuffer = function() {
        var filenameBuffer = this.types_.createUnicodeString(this.filename_);
        var filenameArray = new Uint8Array(filenameBuffer);
        
        var total = 20 + filenameArray.length;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // replace_if_exists
        array[0] = 0; // Not replace
        // UCHAR[7] reserved
        // root_dierctory
        this.types_.setFixed8BytesValue(0, array, 8);
        // filename_length
        this.types_.setFixed4BytesValue(filenameArray.length, array, 16);
        // filename
        this.types_.copyArray(filenameArray, array, 20, filenameArray.length);
        
        return buffer;
    };
    
    FileRenameInformation.prototype.setFilename = function(filename) {
        this.filename_ = filename;
    };
    
    // Export
    
    Models.FileRenameInformation = FileRenameInformation;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
