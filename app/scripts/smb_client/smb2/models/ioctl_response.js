(function(Models, Types, Debug, Constants) {
    "use strict";

    // Constructor

    var IoctlResponse = function() {
        this.types_ = new Types();

        this.structureSize_ = null;
        this.ctlCode_ = null;
        this.fileId_ = null;
        this.inputOffset_ = null;
        this.inputCount_ = null;
        this.outputOffset_ = null;
        this.outputCount_ = null;
        this.flags_ = null;
        this.buffer_ = null; // Uint8Array
    };

    // Public functions

    IoctlResponse.prototype.load = function(packet, appendedDataCount) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();

        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        // USHORT reserved
        this.ctlCode_ = this.types_.getFixed4BytesValue(array, 4);
        this.fileId_ = array.subarray(8, 24);
        this.inputOffset_ = this.types_.getFixed4BytesValue(array, 24);
        this.inputCount_ = this.types_.getFixed4BytesValue(array, 28);
        this.outputOffset_ = this.types_.getFixed4BytesValue(array, 32);
        this.outputCount_ = this.types_.getFixed4BytesValue(array, 36);
        this.flags_ = this.types_.getFixed4BytesValue(array, 40);
        // UINT reserved
        var pos = this.outputOffset_ - Constants.SMB2_HEADER_SIZE;
        this.buffer_ = array.subarray(pos, pos + this.outputCount_ + appendedDataCount);
    };

    IoctlResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };
    
    IoctlResponse.prototype.getCtlCode = function() {
        return this.ctlCode_;
    };
    
    IoctlResponse.prototype.getFileId = function() {
        return this.fileId_;
    };
    
    IoctlResponse.prototype.getInputOffset = function() {
        return this.inputOffset_;
    };
    
    IoctlResponse.prototype.getInputCount = function() {
        return this.inputCount_;
    };
    
    IoctlResponse.prototype.getOutputOffset = function() {
        return this.outputOffset_;
    };
    
    IoctlResponse.prototype.getOutputCount = function() {
        return this.outputCount_;
    };
    
    IoctlResponse.prototype.getFlags = function() {
        return this.flags_;
    };
    
    IoctlResponse.prototype.getBuffer = function() {
        return this.buffer_;
    };

    // Export

    Models.IoctlResponse = IoctlResponse;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
