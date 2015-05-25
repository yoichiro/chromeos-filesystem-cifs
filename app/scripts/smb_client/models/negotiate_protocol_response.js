(function(Types, Constants) {

    // Constructor

    var NegotiateProtocolResponse = function() {
        this.types_ = new Types();
        this.dialectIndex_ = 0;
        this.securityMode_ = 0;
        this.maxMpxCount_ = 0;
        this.maxNumberVCs_ = 0;
        this.maxBufferSize_ = 0;
        this.maxRawSize_ = 0;
        this.sessionKey_ = 0;
        this.capabilities_ = 0;
        this.systemTimeLow_ = 0;
        this.systemTimeHigh_ = 0;
        this.serverTimeZone_ = 0;
        this.encryptionKeyLength_ = 0;

        this.guid_ = []; // Uint8Array
        this.securityBlob_ = []; // Uint8Array

        this.encryptionKey_ = []; // Uint8Array
        this.domainName_ = "";
    };

    // Public functions

    NegotiateProtocolResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        this.dialectIndex_ = this.types_.getFixed2BytesValue(array, 1);
        this.securityMode_ = array[3];
        this.maxMpxCount_ = this.types_.getFixed2BytesValue(array, 4);
        this.maxNumberVCs_ = this.types_.getFixed2BytesValue(array, 6);
        this.maxBufferSize_ = this.types_.getFixed4BytesValue(array, 8);
        this.maxRawSize_ = this.types_.getFixed4BytesValue(array, 12);
        this.sessionKey_ = this.types_.getFixed4BytesValue(array, 16);
        this.capabilities_ = this.types_.getFixed4BytesValue(array, 20);
        this.systemTimeLow_ = this.types_.getFixed4BytesValue(array, 24);
        this.systemTimeHigh_ = this.types_.getFixed4BytesValue(array, 28);
        this.serverTimeZone_ = this.types_.getFixed2BytesSignedValue(array, 32);
        this.encryptionKeyLength_ = array[34];

        if (this.isCapabilityOf(Constants.CAP_EXTENDED_SECURITY)) {
            this.guid_ = new Uint8Array(array.subarray(37, 53));
            this.securityBlob_ = new Uint8Array(array.subarray(53, array.length - 1));
        } else {
            if (this.encryptionKeyLength_ > 0) {
                this.encryptionKey_ = new Uint8Array(array.subarray(37, 37 + this.encryptionKeyLength_));
            }
            // Multiple domain names may be included. Only first name is applied.
            // Also, each domain name is written as Unicode string...
            this.domainName_ = this.types_.getUnicodeNullEndString(array, 37 + this.encryptionKeyLength_).result;
        }
    };

    NegotiateProtocolResponse.prototype.getDialectIndex = function() {
        return this.dialectIndex_ = 0;
    };

    NegotiateProtocolResponse.prototype.getSecurityMode = function() {
        return this.securityMode_;
    };

    NegotiateProtocolResponse.prototype.getMaxMpxCount = function() {
        return this.maxMpxCount_;
    };

    NegotiateProtocolResponse.prototype.getMaxNumberVCs = function() {
        return this.maxNumberVCs_;
    };

    NegotiateProtocolResponse.prototype.getMaxBufferSize = function() {
        return this.maxBufferSize_;
    };

    NegotiateProtocolResponse.prototype.getMaxRawSize = function() {
        return this.maxRawSize_;
    };

    NegotiateProtocolResponse.prototype.getSessionKey = function() {
        return this.sessionKey_;
    };

    NegotiateProtocolResponse.prototype.getCapabilities = function() {
        return this.capabilities_;
    };

    NegotiateProtocolResponse.prototype.isCapabilityOf = function(name) {
        return (this.capabilities_ & name) != 0;
    };

    NegotiateProtocolResponse.prototype.getSystemTimeLow = function() {
        return this.systemTimeLow_;
    };

    NegotiateProtocolResponse.prototype.getSystemTimeHigh = function() {
        return this.systemTimeHigh_;
    };

    NegotiateProtocolResponse.prototype.getSystemTime = function() {
        return this.types_.getDateFromSmbTime.call(this, this.systemTimeHigh_, this.systemTimeLow_);
    };

    NegotiateProtocolResponse.prototype.getServerTimeZone = function() {
        return this.serverTimeZone_;
    };

    NegotiateProtocolResponse.prototype.getEncryptionKeyLength = function() {
        return this.encryptionKeyLength_;
    };

    NegotiateProtocolResponse.prototype.getEncryptionKey = function() {
        return this.encryptionKey_;
    };

    NegotiateProtocolResponse.prototype.getGuid = function() {
        return this.guid_;
    };

    NegotiateProtocolResponse.prototype.getSecurityBlob = function() {
        return this.securityBlob_;
    };

    NegotiateProtocolResponse.prototype.getDomainName = function() {
        return this.domainName_;
    };

    // Export

    SmbClient.NegotiateProtocolResponse = NegotiateProtocolResponse;

})(SmbClient.Types, SmbClient.Constants);
