(function(Models, Types, File) {
    "use strict";

    // Constructor

    var ResponseUtils = function() {
        this.types_ = new Types();
    };

    // Public functions

    ResponseUtils.prototype.getSmbDataUint8Array = function(array) {
        var wordCount = array[0];
        var dataArray = array.subarray(1 + wordCount * 2);
        var dataLength = this.types_.getFixed2BytesValue(dataArray, 0);
        return dataArray.subarray(2, dataLength + 2);
    };

    ResponseUtils.prototype.getOffsetSkippedAndxData = function() {
        return 5; // WordCount(1) + AndX(4)
    };

    ResponseUtils.prototype.readSmbTime = function(array, offset) {
        var low = this.types_.getFixed4BytesValue(array, offset);
        var high = this.types_.getFixed4BytesValue(array, offset + 4);
        return this.types_.getDateFromSmbTime(high, low);
    };

    ResponseUtils.prototype.loadData = function(array, offset, lastNameOffset) {
        var files = [];

        var next = 0;
        var start = 0;

        while (true) {
            // Next Entry Offset
            var nextEntryOffset = this.types_.getFixed4BytesValue(array, next);
            next += 8;
            // Created
            var created = this.readSmbTime(array, next);
            next += 8;
            // Last Access
            var lastAccess = this.readSmbTime(array, next);
            next += 8;
            // Write
            var write = this.readSmbTime(array, next);
            next += 8;
            // Change
            var change = this.readSmbTime(array, next);
            next += 8;
            // End Of File
            var endOfFile = this.types_.getFixed8BytesValue(array, next);
            next += 8;
            // Allocation Size
            var allocationSize = this.types_.getFixed8BytesValue(array, next);
            next += 8;
            // File Attributes
            var fileAttributes = this.types_.getFixed4BytesValue(array, next);
            next += 4;
            // File Name
            var fileNameLength = this.types_.getFixed4BytesValue(array, next);
            next += 4 +
                4 + // EA List Length
                1 + // Short File Name Length
                1 + // Reserved
                24; // Short File Name
            var fileName = this.types_.getFixedLengthUnicodeString(
                array, next, fileNameLength).result;

            var file = new File();
            file.setCreated(created);
            file.setLastAccess(lastAccess);
            file.setWrite(write);
            file.setChange(change);
            file.setFileAttributes(fileAttributes);
            file.setAllocationSize(allocationSize);
            file.setEndOfFile(endOfFile);
            file.setFileName(fileName);
            if (!file.isFileAttributesOf(Constants.SMB_FILE_ATTRIBUTE_HIDDEN) &&
                !file.isFileAttributesOf(Constants.SMB_FILE_ATTRIBUTE_SYSTEM)) {
                files.push(file);
            }

            if (lastNameOffset <= start) {
                break;
            }
            next = start + nextEntryOffset;
            start = next;
        }

        return files;
    };

    // Export

    Models.ResponseUtils = ResponseUtils;

})(SmbClient.Smb1.Models, SmbClient.Types, SmbClient.File);
