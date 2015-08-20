(function(Models) {
    "use strict";
   
    // Constructor
   
    var EmptyRequest = function() {
    };
   
    // Public functions
   
    EmptyRequest.prototype.createSmbParametersArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    EmptyRequest.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };
   
    // Export
   
    Models.EmptyRequest = EmptyRequest;
   
})(SmbClient.Smb1.Models);
