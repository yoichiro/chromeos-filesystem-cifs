(function(Models, Types) {
    "use strict";
   
    // Constructor
   
    var EmptyRequest = function() {
        this.types_ = new Types();
    };
   
    // Public functions
   
    EmptyRequest.prototype.createArrayBuffer = function() {
        var buffer = new ArrayBuffer(4);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(4, array, 0);
        // reserved
        this.types_.setFixed2BytesValue(0, array, 2);
        
        return buffer;
    };

    // Export
   
    Models.EmptyRequest = EmptyRequest;
   
})(SmbClient.Smb2.Models, SmbClient.Types);
