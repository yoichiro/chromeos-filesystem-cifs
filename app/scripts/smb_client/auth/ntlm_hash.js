(function(Auth, Debug, Types, Base) {
    "use strict";

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

    Auth.NtlmHash = NtlmHash;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Types, SmbClient.Auth.HashResponseBase);
