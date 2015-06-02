(function(Types) {
    "use strict";

    // Constructor
    
    var LogoffAndxRequest = function() {
        this.types_ = new Types();
    };
    
    // Public functions
    
    LogoffAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(4);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        return buffer;
    };

    LogoffAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };
    
    // Export
    
    SmbClient.LogoffAndxRequest = LogoffAndxRequest;

})(SmbClient.Types);
