(function(Auth, Types, Constants) {
    "use strict";

    // Constructor

    var Subkey = function() {
        this.types_ = new Types();
    };

    // Public functions

    // originalMasterKey: ArrayBuffer
    Subkey.prototype.createClientSigningKey = function(originalMasterKey) {
        return calculaeKey.call(
            this, originalMasterKey, Constants.NTLM2_SUBKEY_CLIENT_SIGNING_KEY);
    };

    // originalMasterKey: ArrayBuffer
    Subkey.prototype.createServerSigningKey = function(originalMasterKey) {
        return calculaeKey.call(
            this, originalMasterKey, Constants.NTLM2_SUBKEY_SERVER_SIGNING_KEY);
    };

    // weakenedMasterKey: ArrayBuffer
    Subkey.prototype.createClientSealingKey = function(weakenedMasterKey) {
        return calculaeKey.call(
            this, weakenedMasterKey, Constants.NTLM2_SUBKEY_CLIENT_SEALING_KEY);
    };

    // weakenedMasterKey: ArrayBuffer
    Subkey.prototype.createServerSealingKey = function(weakenedMasterKey) {
        return calculaeKey.call(
            this, weakenedMasterKey, Constants.NTLM2_SUBKEY_SERVER_SEALING_KEY);
    };

    // Private functions

    var calculaeKey = function(originalMasterKey, magicString) {
        var magic = this.types_.createSimpleStringArrayBuffer(magicString);

        var total = originalMasterKey.byteLength + magic.byteLength + 1;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        array.set(new Uint8Array(originalMasterKey), 0);
        array.set(new Uint8Array(magic), originalMasterKey.byteLength);
        array[total - 1] = 0; // Null terminated

        var wordArray = CryptoJS.lib.WordArray.create(buffer);
        var md5 = CryptoJS.MD5(wordArray);

        // This returns the result as ArrayBuffer
        return md5.toArrayBuffer();
    };

    // Export

    Auth.Subkey = Subkey;

})(SmbClient.Auth, SmbClient.Types, SmbClient.Constants);
