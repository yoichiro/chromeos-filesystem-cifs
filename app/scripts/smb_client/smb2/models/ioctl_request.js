(function(Models, Types, Debug, Constants) {
    "use strict";

    // Constructor

    var IoctlRequest = function() {
        this.types_ = new Types();

        this.ctlCode_ = Constants.FSCTL_PIPE_TRANSCEIVE;
        this.maxInputResponse_ = 0;
        this.outputOffset_ = Constants.SMB2_HEADER_SIZE + 56;
        this.outputCount_ = 0;
        this.maxOutputResponse_ = 4280;
        this.flags_ = Constants.SMB2_0_IOCTL_IS_FSCTL;
        this.fileId_ = null;
        this.data_ = null;
    };

    // Public functions

    IoctlRequest.prototype.setCtlCode = function(ctlCode) {
        this.ctlCode_ = ctlCode;
    };

    IoctlRequest.prototype.setMaxInputResponse = function(maxInputResponse) {
        this.maxInputResponse_ = maxInputResponse;
    };

    IoctlRequest.prototype.setOutputOffset = function(outputOffset) {
        this.outputOffset_ = outputOffset;
    };

    IoctlRequest.prototype.setOutputCount = function(outputCount) {
        this.outputCount_ = outputCount;
    };

    IoctlRequest.prototype.setMaxOutputResponse = function(maxOutputResponse) {
        this.maxOutputResponse_ = maxOutputResponse;
    };

    IoctlRequest.prototype.setFlags = function(flags) {
        this.flags_ = flags;
    };

    IoctlRequest.prototype.setFileId = function(fileId) {
        this.fileId_ = fileId;
    };

    IoctlRequest.prototype.setSubMessage = function(message) {
        this.data_ = message.createTransactionData();
    };

    IoctlRequest.prototype.createArrayBuffer = function() {
        var dataBuffer = this.data_.createArrayBuffer();

        var total = 56 + dataBuffer.byteLength;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // structure_size
        this.types_.setFixed2BytesValue(57, array, 0);
        // USHORT reserved
        // ctl_code
        this.types_.setFixed4BytesValue(this.ctlCode_, array, 4);
        // file_id
        this.types_.copyArray(this.fileId_, array, 8, 16);
        // input_offset
        this.types_.setFixed4BytesValue(Constants.SMB2_HEADER_SIZE + 56, array, 24);
        // input_count
        this.types_.setFixed4BytesValue(dataBuffer.byteLength, array, 28);
        // max_input_response
        this.types_.setFixed4BytesValue(this.maxInputResponse_, array, 32);
        // output_offset
        this.types_.setFixed4BytesValue(this.outputOffset_, array, 36);
        // output_count
        this.types_.setFixed4BytesValue(this.outputCount_, array, 40);
        // max_output_response
        this.types_.setFixed4BytesValue(this.maxOutputResponse_, array, 44);
        // flags
        this.types_.setFixed4BytesValue(this.flags_, array, 48);
        // UINT reserved
        // buffer
        this.types_.copyArray(new Uint8Array(dataBuffer), array, 56, dataBuffer.byteLength);

        return buffer;
    };

    // Private functions

    // Export

    Models.IoctlRequest = IoctlRequest;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
