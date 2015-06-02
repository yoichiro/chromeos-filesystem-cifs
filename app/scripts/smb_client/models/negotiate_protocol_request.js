(function(Types) {
    "use strict";

    // Constructor

    var NegotiateProtocolRequest = function() {
        this.types_ = new Types();
        this.dialects = [];
    };

    // Public functions

    NegotiateProtocolRequest.prototype.setDialects = function(dialects) {
        this.dialects_ = dialects;
    };

    NegotiateProtocolRequest.prototype.getDialects = function() {
        return this.dialects_;
    };

    NegotiateProtocolRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(0);
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    NegotiateProtocolRequest.prototype.createSmbDataArrayBuffer = function() {
        var dialectBuffers = [];
        var total = 0;
        var i;
        for (i = 0; i < this.dialects_.length; i++) {
            var dialectBuffer = this.types_.createDialectStringArrayBuffer(this.dialects_[i]);
            dialectBuffers.push(dialectBuffer);
            total += dialectBuffer.byteLength;
        }
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        var pos = 0;
        for (i = 0; i < dialectBuffers.length; i++) {
            var dialectArray = new Uint8Array(dialectBuffers[i]);
            array.set(dialectArray, pos);
            pos += dialectArray.length;
        }
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Export

    SmbClient.NegotiateProtocolRequest = NegotiateProtocolRequest;

})(SmbClient.Types);
