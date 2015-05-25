(function(Types, Debug, File, ResponseUtils) {

    // Constructor

    var QueryPathInfoResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.file_ = null;
    };

    // Public functions

    QueryPathInfoResponse.prototype.load = function(array, dataOffset) {
        // Created
        var created = this.responseUtils_.readSmbTime(array, 0);
        // Last Access
        var lastAccess = this.responseUtils_.readSmbTime(array, 8);
        // Write
        var write = this.responseUtils_.readSmbTime(array, 16);
        // Change
        var change = this.responseUtils_.readSmbTime(array, 24);
        // File Attributes
        var fileAttributes = this.types_.getFixed4BytesValue(array, 32);
        // Allocation Size
        var allocationSize = this.types_.getFixed8BytesValue(array, 40);
        // End Of File
        var endOfFile = this.types_.getFixed8BytesValue(array, 48);
        // Full File Name
        var fullFileNameLen = this.types_.getFixed4BytesValue(array, 68);
        var fullFileName =
            this.types_.getFixedLengthUnicodeString(array, 72, fullFileNameLen).result;

        this.file_ = new File();
        this.file_.setCreated(created);
        this.file_.setLastAccess(lastAccess);
        this.file_.setWrite(write);
        this.file_.setChange(change);
        this.file_.setFileAttributes(fileAttributes);
        this.file_.setAllocationSize(allocationSize);
        this.file_.setEndOfFile(endOfFile);
        this.file_.setFullFileName(fullFileName);
        this.file_.setFileName(getNameFromPath.call(this, fullFileName));
    };

    QueryPathInfoResponse.prototype.getFile = function() {
        return this.file_;
    };

    // Private functions

    var getNameFromPath = function(path) {
        var names = path.split("\\");
        var name = names[names.length - 1];
        return name;
    };

    // Export

    SmbClient.QueryPathInfoResponse = QueryPathInfoResponse;

})(SmbClient.Types, SmbClient.Debug, SmbClient.File, SmbClient.ResponseUtils);
