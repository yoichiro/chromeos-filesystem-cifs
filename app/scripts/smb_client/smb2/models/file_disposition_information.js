(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var FileDispositionInformation = function() {
        this.types_ = new Types();
    };
    
    // Public functions
    
    FileDispositionInformation.prototype.getType = function() {
        return Constants.SMB2_0_FILE_DISPOSITION_INFORMATION;
    };
    
    FileDispositionInformation.prototype.createArrayBuffer = function() {
        var total = 1;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        array[0] = 1; // DeletePending
        
        return buffer;
    };
    
    // Export
    
    Models.FileDispositionInformation = FileDispositionInformation;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
