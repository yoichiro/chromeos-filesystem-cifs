(function(Types, Debug, Constants) {

    // Constructor

    var Type3Message = function() {
        this.types_ = new Types();

        this.lmResponse_ = null;
        this.ntlmResponse_ = null;
        this.domainName_ = null;
        this.username_ = null;
        this.workstationName_ = null;
        this.sessionKey_ = 0;
        this.flag_ = null;

        this.type2Message_ = null;
    };

    // Public functions

    Type3Message.prototype.getNtlmSignature = function() {
        return "NTLMSSP";
    };

    Type3Message.prototype.getNtlmMessageType = function() {
        return 0x00000003;
    };

    // response: ArrayBuffer
    Type3Message.prototype.setLmResponse = function(response) {
        this.lmResponse_ = response;
    };

    // response: ArrayBuffer
    Type3Message.prototype.setNtlmResponse = function(response) {
        this.ntlmResponse_ = response;
    };

    Type3Message.prototype.setDomainName = function(domainName) {
        this.domainName_ = domainName;
    };

    Type3Message.prototype.setUsername = function(username) {
        this.username_ = username;
    };

    Type3Message.prototype.setWorkstationName = function(workstationName) {
        this.workstationName_ = workstationName;
    };

    // sessionKey: ArrayBuffer
    Type3Message.prototype.setSessionKey = function(sessionKey) {
        this.sessionKey_ = sessionKey;
    };

    Type3Message.prototype.setFlag = function(flag) {
        this.flag_ = flag;
    };

    Type3Message.prototype.load = function(type2Message) {
        this.type2Message_ = type2Message;
    };

    Type3Message.prototype.createArrayBuffer = function() {
        var total =
                8 + // NTLMSSP Signature
                4 + // NTLM Message Type
                8 + // LM/LMv2 Response Security Buffer
                8 + // NTLM/NTLMv2 Response Security Buffer
                8 + // Domain Name Security Buffer
                8 + // Username Security Buffer
                8 + // Workstation Security Buffer
                8 + // Security Key Security Buffer
                4;  // Flag
        total += this.lmResponse_.byteLength;
        total += this.ntlmResponse_.byteLength;
        total += getStringLength.call(this, this.domainName_);
        total += getStringLength.call(this, this.username_);
        total += getStringLength.call(this, this.workstationName_);
        if (this.sessionKey_) {
            total += this.sessionKey_.byteLength;
        }
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // NTLMSSP Signature
        this.types_.setSimpleNullEndStringTo(this.getNtlmSignature(), array, 0);
        // Type 3 Identifier
        this.types_.setFixed4BytesValue(this.getNtlmMessageType(), array, 8);

        var securityBufferOffset = 12;
        var dataBlockOffset = 64;

        // LM/LMv2 Response
        var next = setSecurityBuffer.call(
            this, new Uint8Array(this.lmResponse_), array,
            securityBufferOffset, dataBlockOffset);
        // NTLM/NTLMv2 Response
        next = setSecurityBuffer.call(
            this, new Uint8Array(this.ntlmResponse_), array,
            next.securityBufferOffset, next.dataBlockOffset);
        // Domain Name
        next = setSecurityBuffer.call(
            this, getStringToUint8Array.call(this, this.domainName_), array,
            next.securityBufferOffset, next.dataBlockOffset);
        // Username
        next = setSecurityBuffer.call(
            this, getStringToUint8Array.call(this, this.username_), array,
            next.securityBufferOffset, next.dataBlockOffset);
        // Workstation Name
        next = setSecurityBuffer.call(
            this, getStringToUint8Array.call(this, this.workstationName_), array,
            next.securityBufferOffset, next.dataBlockOffset);
        // Session Key
        if (this.sessionKey_) {
            next = setSecurityBuffer.call(
                this, new Uint8Array(this.sessionKey_), array,
                next.securityBufferOffset, next.dataBlockOffset);
        } else {
            next = setSecurityBuffer.call(
                this, null, array,
                next.securityBufferOffset, next.dataBlockOffset);
        }
        // Flag
        this.types_.setFixed4BytesValue(this.flag_, array, 60);

        return buffer;
    };

    // Private functions

    var isUnicodeSupport = function() {
        return this.type2Message_.isFlagOf(Constants.NTLMSSP_NEGOTIATE_UNICODE);
    };

    var getStringLength = function(source) {
        var unit = isUnicodeSupport.call(this) ? 2 : 1;
        return source.length * unit;
    };

    var getStringToUint8Array = function(source) {
        if (isUnicodeSupport.call(this, source)) {
            return new Uint8Array(this.types_.createUnicodeString(source));
        } else {
            return new Uint8Array(this.types_.createSimpleStringArrayBuffer(source));
        }
    };

    // data: Uint8Array
    var setSecurityBuffer = function(data, array, securityBufferOffset, dataBlockOffset) {
        if (data) {
            var length = data.length;
            this.types_.setFixed2BytesValue(length, array, securityBufferOffset);
            this.types_.setFixed2BytesValue(length, array, securityBufferOffset + 2);
            this.types_.setFixed4BytesValue(dataBlockOffset, array, securityBufferOffset + 4);
            this.types_.copyArray(data, array, dataBlockOffset, length);
            return {
                securityBufferOffset: securityBufferOffset + 8,
                dataBlockOffset: dataBlockOffset + length
            };
        } else {
            this.types_.setFixed2BytesValue(0, array, securityBufferOffset);
            this.types_.setFixed2BytesValue(0, array, securityBufferOffset + 2);
            this.types_.setFixed4BytesValue(0, array, securityBufferOffset + 4);
            return {
                securityBufferOffset: securityBufferOffset + 8,
                dataBlockOffset: dataBlockOffset
            };
        }
    };

    // Export

    SmbClient.Type3Message = Type3Message;

})(SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
