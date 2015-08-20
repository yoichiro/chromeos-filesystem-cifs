(function(Models, Types, ResponseUtils) {
    "use strict";

    // Constructor

    var NtCreateAndxResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.opLockLevel_ = null; // 1
        this.fid = null; // 2
        this.createDisposition_ = null; // 4
        this.createTime_ = null; // 8
        this.lastAccessTime_ = null; // 8
        this.lastWriteTime_ = null; // 8
        this.lastChangeTime_ = null; // 8
        this.extFileAttributes_ = null; // 4
        this.allocationSize_ = null; // 8
        this.endOfFile_ = null; // 8
        this.resourceType_ = null; // 2
        this.nmPipeStatus_ = null; // 2
        this.directory_ = null; // 1
    };

    // Public functions

    NtCreateAndxResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbParametersAndSmbDataUint8Array();

        var offset = this.responseUtils_.getOffsetSkippedAndxData();

        this.opLockLevel_ = array[offset];
        this.fid_ = this.types_.getFixed2BytesValue(array, offset + 1);
        this.createDisposition_ = this.types_.getFixed4BytesValue(array, offset + 3);
        this.createTime_ = this.types_.getDateFromArray(array, offset + 7);
        this.lastAccessTime_ = this.types_.getDateFromArray(array, offset + 15);
        this.lastWriteTime_ = this.types_.getDateFromArray(array, offset + 23);
        this.lastChangeTime_ = this.types_.getDateFromArray(array, offset + 31);
        this.extFileAttributes_ = this.types_.getFixed4BytesValue(array, offset + 39);
        this.allocationSize_ = this.types_.getFixed8BytesValue(array, offset + 43);
        this.endOfFile_ = this.types_.getFixed8BytesValue(array, offset + 51);
        this.resourceType_ = this.types_.getFixed2BytesValue(array, offset + 59);
        this.nmPipeStatus_ = this.types_.getFixed2BytesValue(array, offset + 61);
        this.directory_ = array[offset + 63];
    };

    NtCreateAndxResponse.prototype.getOpLockLevel = function() {
        return this.opLockLevel_;
    };

    NtCreateAndxResponse.prototype.getFId = function() {
        return this.fid_;
    };

    NtCreateAndxResponse.prototype.getCreateDisposition = function() {
        return this.createDisposition_;
    };

    NtCreateAndxResponse.prototype.getCreateTime = function() {
        return this.createTime_;
    };

    NtCreateAndxResponse.prototype.getLastAccessTime = function() {
        return this.lastAccessTime_;
    };

    NtCreateAndxResponse.prototype.getLastWriteTime = function() {
        return this.lastWriteTime_;
    };

    NtCreateAndxResponse.prototype.getLastChangeTime = function() {
        return this.lastChangeTime_;
    };

    NtCreateAndxResponse.prototype.getExtFileAttributes = function() {
        return this.extFileAttributes_;
    };

    NtCreateAndxResponse.prototype.getAllocationSize = function() {
        return this.allocationSize_;
    };

    NtCreateAndxResponse.prototype.getEndOfFile = function() {
        return this.endOfFile_;
    };

    NtCreateAndxResponse.prototype.getResourceType = function() {
        return this.resourceType_;
    };

    NtCreateAndxResponse.prototype.getNmPipeStatus = function() {
        return this.nmPipeStatus_;
    };

    NtCreateAndxResponse.prototype.isDirectory = function() {
        return this.directory_ === 0x01;
    };

    // Export

    Models.NtCreateAndxResponse = NtCreateAndxResponse;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.ResponseUtils);
