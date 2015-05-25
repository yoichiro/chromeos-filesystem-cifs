(function(Types) {

    // Constructor

    var CloseRequest = function() {
        this.types_ = new Types();

        this.fid_ = null;
        this.lastTimeModified_ = null;
    };

    // Public functions

    // fid: Number
    CloseRequest.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    // lastTimeModified: Date
    CloseRequest.prototype.setLastTimeModified = function(lastTimeModified) {
        this.lastTimeModified_ = lastTimeModified;
    };

    CloseRequest.prototype.createSmbParametersArrayBuffer = function() {
        var buffer = new ArrayBuffer(6);
        var array = new Uint8Array(buffer);

        // FID
        this.types_.setFixed2BytesValue(this.fid_, array, 0);
        // LastTimeModified
        if (this.lastTimeModified_) {
            this.types_.setFixed4BytesValue(this.lastTimeModified_.getTime(), array, 2);
        }

        return buffer;
    };

    CloseRequest.prototype.createSmbDataArrayBuffer = function() {
        return new ArrayBuffer(0);
    };

    // Export
    SmbClient.CloseRequest = CloseRequest;

})(SmbClient.Types);
