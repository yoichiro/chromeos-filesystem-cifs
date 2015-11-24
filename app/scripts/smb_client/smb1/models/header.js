(function(Models, Types, Constants) {
    "use strict";

    // Constructor
    var Header = function() {
        this.types_ = new Types();
        this.protocol_ = "SMB";
        this.command_ = 0;

        this.errorClass_ = 0;
        this.errorCode_ = 0;
        this.ntStyleErrorCode_ = 0;

        this.flag_ = 0;
        this.flag2_ = 0;

        this.treeId_ = 0xffff;
        this.processId_ = 0;
        this.userId_ = 0;
        this.multiplexId_ = 0;
    };

    // Public methods

    Header.prototype.load = function(packet) {
        var headerArray = packet.getHeaderUint8Array();
        this.protocol_ = getProtocol_.call(this, headerArray);
        this.command_ = getCommand_.call(this, headerArray);

        this.errorClass_ = getErrorClass_.call(this, headerArray);
        this.errorCode_ = getErrorCode_.call(this, headerArray);
        this.ntStyleErrorCode_ = getNtStyleErrorCode_.call(this, headerArray);

        this.flag_ = getFlag_.call(this, headerArray);
        this.flag2_ = getFlag2_.call(this, headerArray);

        this.treeId_ = getTreeId_.call(this, headerArray);
        this.processId_ = getProcessId_.call(this, headerArray);
        this.userId_ = getUserId_.call(this, headerArray);
        this.multiplexId_ = getMultiplexId_.call(this, headerArray);
    };

    Header.prototype.createArrayBuffer = function() {
        var buffer = new ArrayBuffer(32);
        var array = new Uint8Array(buffer);

        array[0] = 0xff;
        this.types_.setSimpleStringTo("SMB", array, 1);

        array[4] = this.getCommand();

        if (this.isFlag2Of(Constants.SMB_FLAGS2_32BIT_STATUS)) {
            this.types_.setFixed4BytesValue(this.getNtStyleErrorCode(), array, 5);
        } else {
            array[5] = this.getErrorClass();
            array[6] = 0;
            this.types_.setFixed2BytesValue(this.getErrorCode(), array, 7);
        }

        array[9] = this.getFlag();
        this.types_.setFixed2BytesValue(this.getFlag2(), array, 10);

        this.types_.fillInFixedValue(0, array, 12, 12);

        this.types_.setFixed2BytesValue(this.getTreeId(), array, 24);
        this.types_.setFixed2BytesValue(this.getProcessId(), array, 26);
        this.types_.setFixed2BytesValue(this.getUserId(), array, 28);
        this.types_.setFixed2BytesValue(this.getMultiplexId(), array, 30);

        // This returns the result as ArrayBuffer.
        return buffer;
    };

    Header.prototype.getProtocol = function() {
        return this.protocol_;
    };

    Header.prototype.setProtocol = function(protocol) {
        this.protocol_ = protocol;
    };

    Header.prototype.getCommand = function() {
        return this.command_;
    };

    Header.prototype.setCommand = function(command) {
        this.command_ = command;
    };

    Header.prototype.getErrorClass = function() {
        return this.errorClass_;
    };

    Header.prototype.setErrorClass = function(errorClass) {
        this.errorClass_ = errorClass;
    };

    Header.prototype.getErrorCode = function() {
        return this.errorCode_;
    };

    Header.prototype.setErrorCode = function(errorCode) {
        this.errorCode_ = errorCode;
    };

    Header.prototype.getNtStyleErrorCode = function() {
        return this.ntStyleErrorCode_;
    };

    Header.prototype.setNtStyleErrorCode = function(ntStyleErrorCode) {
        this.ntStyleErrorCode_ = ntStyleErrorCode;
    };

    Header.prototype.getFlag = function() {
        return this.flag_;
    };

    Header.prototype.setFlag = function(flag) {
        this.flag_ = flag;
    };

    Header.prototype.getFlag2 = function() {
        return this.flag2_;
    };

    Header.prototype.setFlag2 = function(flag2) {
        this.flag2_ = flag2;
    };

    Header.prototype.getTreeId = function() {
        return this.treeId_;
    };

    Header.prototype.setTreeId = function(treeId) {
        this.treeId_ = treeId;
    };

    Header.prototype.getProcessId = function() {
        return this.processId_;
    };

    Header.prototype.setProcessId = function(processId) {
        this.processId_ = processId;
    };

    Header.prototype.getUserId = function() {
        return this.userId_;
    };

    Header.prototype.setUserId = function(userId) {
        this.userId_ = userId;
    };

    Header.prototype.getMultiplexId = function() {
        return this.multiplexId_;
    };

    Header.prototype.setMultiplexId = function(multiplexId) {
        this.multiplexId_ = multiplexId;
    };

    /*jslint bitwise: true */
    Header.prototype.isFlagOf = function(field) {
        return (this.getFlag() & field) !== 0;
    };

    Header.prototype.setFlag = function(flag) {
        this.flag_ = flag;
    };

    /*jslint bitwise: true */
    Header.prototype.isFlag2Of = function(field) {
        return (this.getFlag2() & field) !== 0;
    };

    Header.prototype.setFlag2 = function(flag2) {
        this.flag2_ = flag2;
    };

    // Private methods

    var getProtocol_ = function(headerArray) {
        var protocol = this.types_.getFixedLengthString(headerArray, 1, 3);
        return protocol;
    };

    var getCommand_ = function(headerArray) {
        var command = headerArray[4];
        return command;
    };

    var getErrorClass_ = function(headerArray) {
        var errorClass = headerArray[5];
        return errorClass;
    };

    var getErrorCode_ = function(headerArray) {
        var errorCode = this.types_.getFixed2BytesValue(headerArray, 7);
        return errorCode;
    };

    var getNtStyleErrorCode_ = function(headerArray) {
        var errorCode = this.types_.getFixed4BytesValue(headerArray, 5);
        return errorCode;
    };

    var getFlag_ = function(headerArray) {
        var flag = headerArray[9];
        return flag;
    };

    var getFlag2_ = function(headerArray) {
        var flag2 = this.types_.getFixed2BytesValue(headerArray, 10);
        return flag2;
    };

    var getTreeId_ = function(headerArray) {
        var treeId = this.types_.getFixed2BytesValue(headerArray, 24);
        return treeId;
    };

    var getProcessId_ = function(headerArray) {
        var processId = this.types_.getFixed2BytesValue(headerArray, 26);
        return processId;
    };

    var getUserId_ = function(headerArray) {
        var userId = this.types_.getFixed2BytesValue(headerArray, 28);
        return userId;
    };

    var getMultiplexId_ = function(headerArray) {
        var multiplexId = this.types_.getFixed2BytesValue(headerArray, 30);
        return multiplexId;
    };

    // Export

    Models.Header = Header;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.Constants);
