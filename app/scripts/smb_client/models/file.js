(function(Constants) {

    // Constructor

    var File = function() {
        this.created_ = null;
        this.lastAccess_ = null;
        this.write_ = null;
        this.change_ = null;
        this.fileAttributes_ = null;
        this.allocationSize_ = null;
        this.endOfFile_ = null;
        this.fileName_ = null;
        this.fullFileName_ = null;
    };

    // Public functions

    File.prototype.getCreated = function() {
        return this.created_;
    };

    File.prototype.setCreated = function(created) {
        this.created_ = created;
    };

    File.prototype.getLastAccess = function() {
        return this.lastAccess_;
    };

    File.prototype.setLastAccess = function(lastAccess) {
        this.lastAccess_ = lastAccess;
    };

    File.prototype.getWrite = function() {
        return this.write_;
    };

    File.prototype.setWrite = function(write) {
        this.write_ = write;
    };

    File.prototype.getChange = function() {
        return this.change_;
    };

    File.prototype.setChange = function(change) {
        this.change_ = change;
    };

    File.prototype.getFileAttributes = function() {
        return this.fileAttributes_;
    };

    File.prototype.setFileAttributes = function(fileAttributes) {
        this.fileAttributes_ = fileAttributes;
    };

    File.prototype.isFileAttributesOf = function(flag) {
        return (this.fileAttributes_ & flag) != 0;
    };

    File.prototype.getAllocationSize = function() {
        return this.allocationSize_;
    };

    File.prototype.setAllocationSize = function(allocationSize) {
        this.allocationSize_ = allocationSize;
    };

    File.prototype.getEndOfFile = function() {
        return this.endOfFile_;
    };

    File.prototype.setEndOfFile = function(endOfFile) {
        this.endOfFile_ = endOfFile;
    };

    File.prototype.isDirectory = function() {
        return (this.fileAttributes_ & Constants.SMB_FILE_ATTRIBUTE_DIRECTORY) !== 0;
    };

    File.prototype.getFileName = function() {
        return this.fileName_;
    };

    File.prototype.setFileName = function(fileName) {
        this.fileName_ = fileName;
    };

    File.prototype.getFullFileName = function() {
        return this.fullFileName_;
    };

    File.prototype.setFullFileName = function(fullFileName) {
        this.fullFileName_ = fullFileName;
    };

    // Export

    SmbClient.File = File;

})(SmbClient.Constants);
