(function(Types, Debug) {

    // Constructor

    var Type2Message = function() {
        this.types_ = new Types();

        this.ntlmSignature_ = null;
        this.ntlmMessageType_ = null;
        this.flag_ = null;
        this.targetName_ = null;
        this.challenge_ = null;
        this.context_ = null;
        this.targetInformation_ = null;
    };

    // Public functions

    // array: Unit8Array
    Type2Message.prototype.load = function(array) {
        this.ntlmSignature_ = this.types_.getNullEndString(array, 0).result;
        this.ntlmMessageType_ = this.types_.getFixed4BytesValue(array, 8);
        this.targetName_ = readSecurityBufferAsString.call(this, array, 12);
        this.flag_ = this.types_.getFixed4BytesValue(array, 20);
        this.challenge_ = array.subarray(24, 32);
        // TODO: Should consider that the context was not set.
        this.context_ = array.subarray(32, 40);
        // TODO: Should consider that the target information was not set.
        this.targetInformation_ = readSecurityBufferAsArray.call(this, array, 40);
    };

    Type2Message.prototype.getNtlmSignature = function() {
        return this.ntlmSignature_;
    };

    Type2Message.prototype.getNtlmMessageType = function() {
        return this.ntlmMessageType_;
    };

    Type2Message.prototype.isFlagOf = function(field) {
        return (this.flag_ & field) === field;
    };

    Type2Message.prototype.getChallenge = function() {
        return this.challenge_;
    };

    Type2Message.prototype.getContext = function() {
        return this.context_;
    };

    Type2Message.prototype.getTargetInformation = function() {
        return this.targetInformation_;
    };

    // Private functions

    // This returns the result as String.
    var readSecurityBufferAsString = function(array, offset) {
        var securityBufferLength = this.types_.getFixed2BytesValue(array, offset);
        var securityBufferOffset = this.types_.getFixed4BytesValue(array, offset + 4);
        if (securityBufferLength === 0) {
            return "";
        } else {
            return this.types_.getFixedLengthString(array, securityBufferOffset, securityBufferLength);
        }
    };

    // This returns the result as Uint8Array.
    var readSecurityBufferAsArray = function(array, offset) {
        var securityBufferLength = this.types_.getFixed2BytesValue(array, offset);
        var securityBufferOffset = this.types_.getFixed4BytesValue(array, offset + 4);
        if (securityBufferLength === 0) {
            return new Uint8Array([]);
        } else {
            return array.subarray(securityBufferOffset, securityBufferOffset + securityBufferLength);
        }
    };

    // Export

    SmbClient.Type2Message = Type2Message;

})(SmbClient.Types, SmbClient.Debug);
