(function(Types) {
    "use strict";

    // Constructor

    var EchoRequest = function() {
        this.types_ = new Types();
        this.message_ = "";
        this.echoCount_ = 0;
    };

    // Public functions

    EchoRequest.prototype.setMessage = function(message) {
        this.message_ = message;
    };

    EchoRequest.prototype.setEchoCount = function(echoCount) {
        this.echoCount_ = echoCount;
    };

    EchoRequest.prototype.getMessage = function() {
        return this.message_;
    };

    EchoRequest.prototype.getEchoCount = function() {
        return this.echoCount_;
    };

    EchoRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(2);
        var array = new Uint8Array(buffer);
        this.types_.setFixed2BytesValue(this.echoCount_, array, 0);
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    EchoRequest.prototype.createSmbDataArrayBuffer = function() {
        // This returns the result as ArrayBuffer.
        return this.types_.createSimpleStringArrayBuffer(this.message_);
    };

    // Export

    SmbClient.EchoRequest = EchoRequest;

})(SmbClient.Types);
