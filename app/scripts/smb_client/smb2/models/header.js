(function(Models, Types, Constants) {
    "use strict";

    // Constructor
    var Header = function() {
        this.types_ = new Types();

        this.protocol_ = "SMB";
        this.structureSize_ = 64;
        this.creditCharge_ = 1;
        this.channelSequence_ = 0;
        this.status_ = 0;
        this.command_ = 0;
        this.creditsRequested_ = 1;
        this.creditsGranted_ = 0;
        this.flags_ = 0;
        this.chainOffset_ = 0;
        this.messageId_ = 0;
        this.processId_ = 0;
        this.treeId_ = 0;
        this.sessionId_ = 0;
        this.signature_ = 0;
    };

    // Public methods

    Header.prototype.load = function(packet) {
        var array = packet.getHeaderUint8Array();
        this.protocol_ = this.types_.getFixedLengthString(array, 1, 3);
        this.structureSize_ = this.types_.getFixed2BytesValue(array, 4);
        this.creditCharge_ = this.types_.getFixed2BytesValue(array, 6);
        this.channelSequence_ = this.types_.getFixed2BytesValue(array, 8);
        this.status_ = this.types_.getFixed4BytesValue(array, 8);
        this.command_ = this.types_.getFixed2BytesValue(array, 12);
        this.creditsRequested_ = this.types_.getFixed2BytesValue(array, 14);
        this.creditsGranted_ = this.creditsRequested_;
        this.flags_ = this.types_.getFixed4BytesValue(array, 16);
        this.chainOffset_ = this.types_.getFixed4BytesValue(array, 20);
        this.messageId_ = this.types_.getFixed8BytesValue(array, 24);
        this.processId_ = this.types_.getFixed4BytesValue(array, 32);
        this.treeId_ = this.types_.getFixed4BytesValue(array, 36);
        this.sessionId_ = this.types_.getFixed8BytesValue(array, 40);
        this.signature_ = array.subarray(48, 64);
    };

    // For Request Header
    Header.prototype.createArrayBuffer = function() {
        var buffer = new ArrayBuffer(64);
        var array = new Uint8Array(buffer);

        array[0] = 0xfe;
        this.types_.setSimpleStringTo(this.protocol_, array, 1);

        this.types_.setFixed2BytesValue(this.structureSize_, array, 4);
        this.types_.setFixed2BytesValue(this.creditCharge_, array, 6);
        this.types_.setFixed2BytesValue(this.channelSequence_, array, 8);
        this.types_.setFixed2BytesValue(0, array, 10); // Reserved
        this.types_.setFixed2BytesValue(this.command_, array, 12);
        this.types_.setFixed2BytesValue(this.creditsRequested_, array, 14);
        this.types_.setFixed4BytesValue(this.flags_, array, 16);
        this.types_.setFixed4BytesValue(this.chainOffset_, array, 20);
        this.types_.setFixed8BytesValue(this.messageId_, array, 24);
        this.types_.setFixed4BytesValue(this.processId_, array, 32);
        this.types_.setFixed4BytesValue(this.treeId_, array, 36);
        this.types_.setFixed8BytesValue(this.sessionId_, array, 40);
        this.types_.copyArray(this.signature_, array, 48, 16);

        // This returns the result as ArrayBuffer.
        return buffer;
    };

    Header.prototype.getProtocol = function() {
        return this.protocol_;
    };

    Header.prototype.setProtocol = function(protocol) {
        this.protocol_ = protocol;
    };

    Header.prototype.getStructureSize = function() {
        return this.structureSize_;
    };

    Header.prototype.setStructureSize = function(structureSize) {
        this.structureSize_ = structureSize;
    };

    Header.prototype.getCreditCharge = function() {
        return this.creditCharge_;
    };

    Header.prototype.setCreditCharge = function(creditCharge) {
        this.creditCharge_ = creditCharge;
    };

    Header.prototype.getChannelSequence = function() {
        return this.channelSequence_;
    };

    Header.prototype.setChannelSequence = function(channelSequence) {
        this.channelSequence_ = channelSequence;
    };

    Header.prototype.getStatus = function() {
        return this.status_;
    };

    Header.prototype.setStatus = function(status) {
        this.status_ = status;
    };

    Header.prototype.getCommand = function() {
        return this.command_;
    };

    Header.prototype.setCommand = function(command) {
        this.command_ = command;
    };

    Header.prototype.getCreditsRequested = function() {
        return this.creditsRequested_;
    };

    Header.prototype.setCreditsRequested = function(creditsRequested) {
        this.creditsRequested_ = creditsRequested;
    };

    Header.prototype.getCreditsGranted = function() {
        return this.creditsGranted_;
    };

    Header.prototype.setCreditsGranted = function(creditsGranted) {
        this.creditsGranted_ = creditsGranted;
    };

    Header.prototype.getFlags = function() {
        return this.flags_;
    };

    Header.prototype.setFlags = function(flags) {
        this.flags_ = flags;
    };

    /*jslint bitwise: true */
    Header.prototype.isFlagsOf = function(field) {
        return (this.getFlags() & field) !== 0;
    };

    Header.prototype.getChainOffset = function() {
        return this.chainOffset_;
    };

    Header.prototype.setChainOffset = function(chainOffset) {
        this.chainOffset_ = chainOffset;
    };

    Header.prototype.getMessageId = function() {
        return this.messageId_;
    };

    Header.prototype.setMessageId = function(messageId) {
        this.messageId_ = messageId;
    };

    Header.prototype.getProcessId = function() {
        return this.processId_;
    };

    Header.prototype.setProcessId = function(processId) {
        this.processId_ = processId;
    };

    Header.prototype.getTreeId = function() {
        return this.treeId_;
    };

    Header.prototype.setTreeId = function(treeId) {
        this.treeId_ = treeId;
    };

    Header.prototype.getSessionId = function() {
        return this.sessionId_;
    };

    Header.prototype.setSessionId = function(sessionId) {
        this.sessionId_ = sessionId;
    };

    Header.prototype.getSignature = function() {
        return this.signature_;
    };

    Header.prototype.setSignature = function(signature) {
        this.signature_ = signature;
    };

    // Export

    Models.Header = Header;

})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants);
