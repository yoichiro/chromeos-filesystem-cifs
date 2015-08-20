(function(Models, Types, Constants) {
    "use strict";

    // Constructor

    /*jslint bitwise: true */
    var NtCreateAndxRequest = function() {
        this.types_ = new Types();

        /* If SmbNamedPipe, flags:0x16, desiredAccess:0x20000 */
        this.flags_ = 0; // 4
        this.rootDirectoryFId = 0; // 4
        this.desiredAccess_ =
            Constants.FILE_READ_DATA |
            Constants.FILE_READ_EA |
            Constants.FILE_READ_ATTRIBUTES; // 4
        this.allocationSize_ = 0; // 8
        this.extFileAttributes_ = 0; // 4
        this.shareAccess_ = 0; // 4
        this.createDisposition_ = 0; // 4
        this.createOptions_ = 0; // 4
        this.impersonationLevel_ = Constants.SEC_IMPERSONATE; // 4
        this.securityFlags_ =
            Constants.SMB_SECURITY_CONTEXT_TRACKING |
            Constants.SMB_SECURITY_EFFECTIVE_ONLY; // 1

        this.fileName_ = null; // Variable string
    };

    // Public functions

    NtCreateAndxRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(48);
        var array = new Uint8Array(buffer);

        // Next command for ANDX chain
        array[0] = 0xFF;
        array[1] = 0;
        this.types_.setFixed2BytesValue(0, array, 2);

        array[4] = 0;
        var nameLength = (this.fileName_.length) * 2;
        var offset = 5;
        offset = this.types_.setFixed2BytesValue(nameLength, array, offset);
        offset = this.types_.setFixed4BytesValue(this.flags_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.rootDirectoryFId_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.desiredAccess_, array, offset);
        offset = this.types_.setFixed8BytesValue(this.allocationSize_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.extFileAttributes_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.shareAccess_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.createDisposition_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.createOptions_, array, offset);
        offset = this.types_.setFixed4BytesValue(this.impersonationLevel_, array, offset);
        array[offset] = this.securityFlags_;

        return buffer;
    };

    NtCreateAndxRequest.prototype.createSmbDataArrayBuffer = function() {
        var offsetOfAll = 32 + 48;
        var pad = 0;
        if ((offsetOfAll - 4) % 2 === 0) {
            pad = 1;
        }

        var nameLength = (this.fileName_.length + 1) * 2;
        var buffer = new ArrayBuffer(pad + nameLength);
        var array = new Uint8Array(buffer);

        this.types_.setUnicodeNullEndString(this.fileName_, array, pad);

        return buffer;
    };

    NtCreateAndxRequest.prototype.setFlags = function(flags) {
        this.flags_ = flags;
    };

    NtCreateAndxRequest.prototype.setRootDirectoryFId = function(rootDirectoryFId) {
        this.rootDirectoryFId_ = rootDirectoryFId;
    };

    NtCreateAndxRequest.prototype.setDesiredAccess = function(desiredAccess) {
        this.desiredAccess_ = desiredAccess;
    };

    NtCreateAndxRequest.prototype.setAllocationSize = function(allocationSize) {
        this.allocationSize_ = allocationSize;
    };

    NtCreateAndxRequest.prototype.setExtFileAttributes = function(extFileAttributes) {
        this.extFileAttributes_ = extFileAttributes;
    };

    NtCreateAndxRequest.prototype.setShareAccess = function(shareAccess) {
        this.shareAccess_ = shareAccess;
    };

    NtCreateAndxRequest.prototype.setCreateDisposition = function(createDisposition) {
        this.createDisposition_ = createDisposition;
    };

    NtCreateAndxRequest.prototype.setCreateOptions = function(createOptions) {
        this.createOptions_ = createOptions;
    };

    NtCreateAndxRequest.prototype.setImpersonationLevel = function(impersonationLevel) {
        this.impersonationLevel_ = impersonationLevel;
    };

    NtCreateAndxRequest.prototype.setSecurityFlags = function(securityFlags) {
        this.securityFlags_ = securityFlags;
    };

    NtCreateAndxRequest.prototype.setFileName = function(fileName) {
        this.fileName_ = fileName;
    };

    // Export

    Models.NtCreateAndxRequest = NtCreateAndxRequest;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Constants);
