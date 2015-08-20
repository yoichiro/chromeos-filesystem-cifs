(function(Models, Types, Constants, Debug) {
    "use strict";

    // Constructor

    var SessionSetupAndxRequest = function() {
        this.types_ = new Types();

        this.maxBufferSize_ = null;
        this.maxMpxCount_ = null;
        this.vcNumber_ = null;
        this.sessionKey_ = null;
        this.capabilities_ = null;

        this.nativeOS_ = "ChromeOS";
        this.nativeLanMan_ = "File System for CIFS";

        this.extendedSecurity_ = null;

        this.securityBlobLength_ = null;
        this.securityBlob_ = null;
        
        this.caseInsensitivePassword_ = null; // Uint8Array
        this.caseSensitivePassword_ = null; // Uint8Array
        this.accountName_ = null;
        this.primaryDomain_ = null;
    };

    // Public functions

    /*jslint bitwise: true */
    SessionSetupAndxRequest.prototype.load = function(negotiateProtocolResponse, options) {
        this.maxBufferSize_ = negotiateProtocolResponse.getMaxBufferSize();
        this.maxMpxCount_ = negotiateProtocolResponse.getMaxMpxCount();
        //this.maxMpxCount_ = 10;
        this.vcNumber_ = 1;
        this.sessionKey_ = negotiateProtocolResponse.getSessionKey();
        //this.sessionKey_ = 0;
        //this.capabilities_ = negotiateProtocolResponse.getCapabilities();
        this.capabilities_ =
            Constants.CAP_STATUS32 |
            Constants.CAP_NT_SMBS |
            Constants.CAP_UNICODE;

        this.extendedSecurity_ = options.extendedSecurity;
        
        if (this.extendedSecurity_) {
            this.capabilities_ |= Constants.CAP_EXTENDED_SECURITY;
            this.securityBlob_ = options.ntlmMessage.createArrayBuffer();
            this.securityBlobLength_ = this.securityBlob_.byteLength;
        } else {
            this.caseInsensitivePassword_ = options.caseInsensitivePassword;
            this.caseSensitivePassword_ = options.caseSensitivePassword;
            this.accountName_ = options.accountName;
            this.primaryDomain_ = options.primaryDomain;
        }
    };

    SessionSetupAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var total = this.extendedSecurity_ ? 24 : 26;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        // MaxBufferSize
        this.types_.setFixed2BytesValue(this.maxBufferSize_, array, 4);
        // MaxMpxCount
        this.types_.setFixed2BytesValue(this.maxMpxCount_, array, 6);
        // VcNumber
        this.types_.setFixed2BytesValue(this.vcNumber_, array, 8);
        // SessionKey
        this.types_.setFixed4BytesValue(this.sessionKey_, array, 10);
        if (this.extendedSecurity_) {
            // SecurityBlobLength
            this.types_.setFixed2BytesValue(this.securityBlobLength_, array, 14);
            // Reserved
            this.types_.setFixed4BytesValue(0, array, 16);
            // Capabilities
            this.types_.setFixed4BytesValue(this.capabilities_, array, 20);
        } else {
            // CaseInsensitivePasswordLength
            this.types_.setFixed2BytesValue(this.caseInsensitivePassword_.length, array, 14);
            // CaseSensitivePasswordLength
            this.types_.setFixed2BytesValue(this.caseSensitivePassword_.length, array, 16);
            // Reserved
            this.types_.setFixed4BytesValue(0, array, 18);
            // Capabilities
            this.types_.setFixed4BytesValue(this.capabilities_, array, 22);
        }

        return buffer;
    };

    SessionSetupAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        var offsetOfAll;
        var pad;
        var total;
        var buffer;
        var array;
        var pos;
        if (this.extendedSecurity_) {
            offsetOfAll = 32 + 24 + this.securityBlobLength_;
            pad = 0;
            if ((offsetOfAll - 4) % 2 === 0) {
                pad = 1;
            }
            total =
                    this.securityBlobLength_ +
                    pad +
                    ((this.nativeOS_.length + 1) * 2) +
                    ((this.nativeLanMan_.length + 1) * 2);
            buffer = new ArrayBuffer(total);
            array = new Uint8Array(buffer);
    
            var securityBlobArray = new Uint8Array(this.securityBlob_);
            this.types_.copyArray(securityBlobArray, array, 0, this.securityBlobLength_);
            pos = this.securityBlobLength_ + pad;
            pos = this.types_.setUnicodeNullEndString(this.nativeOS_, array, pos);
            this.types_.setUnicodeNullEndString(this.nativeLanMan_, array, pos);
    
            return buffer;
        } else {
            offsetOfAll = 32 + 26 + this.caseInsensitivePassword_.length + this.caseSensitivePassword_.length;
            pad = 0;
            if ((offsetOfAll - 4) % 2 === 0) {
                pad = 1;
            }
            total =
                    this.caseInsensitivePassword_.length +
                    this.caseSensitivePassword_.length +
                    pad +
                    ((this.accountName_.length + 1) * 2) +
                    ((this.primaryDomain_.length + 1) * 2) +
                    ((this.nativeOS_.length + 1) * 2) +
                    ((this.nativeLanMan_.length + 1) * 2);
            buffer = new ArrayBuffer(total);
            array = new Uint8Array(buffer);
    
            this.types_.copyArray(this.caseInsensitivePassword_, array, 0, this.caseInsensitivePassword_.length);
            this.types_.copyArray(
                this.caseSensitivePassword_, array, this.caseInsensitivePassword_.length, this.caseSensitivePassword_.length);
            pos = this.caseInsensitivePassword_.length + this.caseSensitivePassword_.length + pad;
            pos = this.types_.setUnicodeNullEndString(this.accountName_, array, pos);
            pos = this.types_.setUnicodeNullEndString(this.primaryDomain_, array, pos);
            pos = this.types_.setUnicodeNullEndString(this.nativeOS_, array, pos);
            this.types_.setUnicodeNullEndString(this.nativeLanMan_, array, pos);
    
            return buffer;
        }
    };

    // Export

    Models.SessionSetupAndxRequest = SessionSetupAndxRequest;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);
