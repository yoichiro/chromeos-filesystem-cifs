(function(Auth, Constants, Types, Debug) {
    "use strict";

    // Constructor

    var Type1Message = function() {
        this.types_ = new Types();

        this.flag_ = 0;
        this.suppliedDomain_ = null;
        this.suppliedWorkstation_ = null;
    };

    // Public functions

    Type1Message.prototype.getNtlmSignature = function() {
        return "NTLMSSP";
    };

    Type1Message.prototype.getNtlmMessageType = function() {
        return 0x00000001;
    };

    Type1Message.prototype.setFlag = function(flag) {
        this.flag_ = flag;
    };

    /*jslint bitwise: true */
    Type1Message.prototype.isFlagOf = function(field) {
        return (this.flag_ & field) === field;
    };

    Type1Message.prototype.setSuppliedDomain = function(domain) {
        this.suppliedDomain_ = domain;
    };

    Type1Message.prototype.setSuppliedWorkstation = function(workstation) {
        this.suppliedWorkstation_ = workstation;
    };

    Type1Message.prototype.createArrayBuffer = function() {
        var total =
                8 + // NTLMSSP Signature
                4 + // Type 1 Identifier
                4; // Flag
        Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED = 0x00001000;
        Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED = 0x00002000;
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED)) {
            total = total +
                8 + // Supplied Domain Security Buffer
                this.suppliedDomain_.length; // Supplied Domain String
        }
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED)) {
            total = total +
                8 + // Supplied Workstation Security Buffer
                this.suppliedWorkstation_.length; // Supplied Workstation String
        }
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // NTLMSSP Signature
        this.types_.setSimpleNullEndStringTo(this.getNtlmSignature(), array, 0);
        // Type 1 Identifier
        this.types_.setFixed4BytesValue(this.getNtlmMessageType(), array, 8);
        // Flag
        this.types_.setFixed4BytesValue(this.flag_, array, 12);

        // Supplied Domain Security Buffer
        var suppliedDomainDataPos;
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED)) {
            this.types_.setFixed2BytesValue(this.suppliedDomain_.length, array, 16);
            this.types_.setFixed2BytesValue(this.suppliedDomain_.length, array, 18);
            if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED)) {
                this.types_.setFixed4BytesValue(32, array, 20);
                suppliedDomainDataPos = 32;
            } else {
                this.types_.setFixed4BytesValue(24, array, 20);
                suppliedDomainDataPos = 24;
            }
        }

        // Supplied Workstation Security Buffer
        var suppliedWorkstationDataPos;
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED)) {
            var offset;
            if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED)) {
                offset = 24;
            } else {
                offset = 16;
            }
            this.types_.setFixed2BytesValue(this.suppliedWorkstation_.length, array, offset);
            this.types_.setFixed2BytesValue(this.suppliedWorkstation_.length, array, offset + 2);
            if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED)) {
                this.types_.setFixed4BytesValue(32 + this.suppliedDomain_.length, array, offset + 4);
                suppliedWorkstationDataPos = 32 + this.suppliedDomain_.length;
            } else {
                this.types_.setFixed4BytesValue(24, array, offset + 4);
                suppliedWorkstationDataPos = 24;
            }
        }

        // Supplied Domain Data
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED)) {
            this.types_.setSimpleStringTo(this.suppliedDomain_, array, suppliedDomainDataPos);
        }

        // Supplied Workstation Data
        if (this.isFlagOf(Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED)) {
            this.types_.setSimpleStringTo(this.suppliedWorkstation_, array, suppliedWorkstationDataPos);
        }

        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Private functions

    // Export

    Auth.Type1Message = Type1Message;

})(SmbClient.Auth, SmbClient.Constants, SmbClient.Types, SmbClient.Debug);
