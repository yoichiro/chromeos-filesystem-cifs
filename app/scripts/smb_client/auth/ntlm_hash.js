(function(Debug, Types, Base) {

    // Constructor

    var NtlmHash = function() {
        this.types_ = new Types();
        this.base_ = new Base();
    };

    // Public functions

    NtlmHash.prototype.create = function(password) {
        var unicodePasswordBuffer = this.types_.createUnicodeString(password);
        var unicodePasswordWordArray = CryptoJS.lib.WordArray.create(unicodePasswordBuffer);
        var hash = CryptoJS.MD4(unicodePasswordWordArray);
        var buffer = hash.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Export

    SmbClient.NtlmHash = NtlmHash;

})(SmbClient.Debug, SmbClient.Types, SmbClient.HashResponseBase);
