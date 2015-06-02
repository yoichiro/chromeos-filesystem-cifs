(function(Types, Constants, Debug) {
    "use strict";

    // Constructor

    var SessionSetupAndxRequest = function() {
        this.types_ = new Types();

        this.maxBufferSize_ = null;
        this.maxMpxCount_ = null;
        this.vcNumber_ = null;
        this.sessionKey_ = null;
        this.securityBlobLength_ = null;
        this.capabilities_ = null;

        this.nativeOS_ = "ChromeOS";
        this.nativeLanMan_ = "File System for CIFS";

        this.securityBlob_ = null;
    };

    // Public functions

    /*jslint bitwise: true */
    SessionSetupAndxRequest.prototype.load = function(negotiateProtocolResponse, ntlmMessage) {
        this.maxBufferSize_ = negotiateProtocolResponse.getMaxBufferSize();
        this.maxMpxCount_ = negotiateProtocolResponse.getMaxMpxCount();
        //this.maxMpxCount_ = 10;
        this.vcNumber_ = 1;
        this.sessionKey_ = negotiateProtocolResponse.getSessionKey();
        //this.sessionKey_ = 0;
        //this.capabilities_ = negotiateProtocolResponse.getCapabilities();
        this.capabilities_ =
            Constants.CAP_EXTENDED_SECURITY |
            Constants.CAP_DFS |
            Constants.CAP_STATUS32 |
            Constants.CAP_NT_SMBS |
            Constants.CAP_UNICODE;

        this.securityBlob_ = ntlmMessage.createArrayBuffer();
        this.securityBlobLength_ = this.securityBlob_.byteLength;
    };

    SessionSetupAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(24);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        this.types_.setFixed2BytesValue(this.maxBufferSize_, array, 4);
        this.types_.setFixed2BytesValue(this.maxMpxCount_, array, 6);
        this.types_.setFixed2BytesValue(this.vcNumber_, array, 8);
        this.types_.setFixed4BytesValue(this.sessionKey_, array, 10);
        this.types_.setFixed2BytesValue(this.securityBlobLength_, array, 14);
        this.types_.setFixed4BytesValue(0, array, 16);
        this.types_.setFixed4BytesValue(this.capabilities_, array, 20);

        return buffer;
    };

    SessionSetupAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        var offsetOfAll = 32 + 24 + this.securityBlobLength_;
        var pad = 0;
        if ((offsetOfAll - 4) % 2 === 0) {
            pad = 1;
        }
        var total =
                this.securityBlobLength_ +
                pad +
                ((this.nativeOS_.length + 1) * 2) +
                ((this.nativeLanMan_.length + 1) * 2);
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        var securityBlobArray = new Uint8Array(this.securityBlob_);
        this.types_.copyArray(securityBlobArray, array, 0, this.securityBlobLength_);
        var pos = this.securityBlobLength_ + pad;
        pos = this.types_.setUnicodeNullEndString(this.nativeOS_, array, pos);
        this.types_.setUnicodeNullEndString(this.nativeLanMan_, array, pos);

        return buffer;
    };

    // Export

    SmbClient.SessionSetupAndxRequest = SessionSetupAndxRequest;

})(SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
