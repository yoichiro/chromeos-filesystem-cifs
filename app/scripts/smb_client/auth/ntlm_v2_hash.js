(function(Debug, Types, Base, NtlmHash) {

    // Constructor

    var NtlmV2Hash = function() {
        this.types_ = new Types();
        this.base_ = new Base();
    };

    // Public functions

    NtlmV2Hash.prototype.create = function(username, password, authenticationTarget) {
        var ntlmHash = new NtlmHash();
        var ntlmHashBuffer = ntlmHash.create(password);
        var ntlmHashWordArray = CryptoJS.lib.WordArray.create(ntlmHashBuffer);

        var upperCaseUsername = username.toUpperCase();
        var upperCaseAuthTarget = authenticationTarget.toUpperCase();
        var uniUpperCaseUsernameBuffer = this.types_.createUnicodeString(upperCaseUsername);
        var uniUpperCaseAuthTargetBuffer = this.types_.createUnicodeString(upperCaseAuthTarget);
        var concated = CryptoJS.lib.WordArray.create(uniUpperCaseUsernameBuffer).concat(CryptoJS.lib.WordArray.create(uniUpperCaseAuthTargetBuffer));

        var ntlmV2HashWordArray = CryptoJS.HmacMD5(concated, ntlmHashWordArray);
        var buffer = ntlmV2HashWordArray.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Export

    SmbClient.NtlmV2Hash = NtlmV2Hash;

})(SmbClient.Debug, SmbClient.Types, SmbClient.HashResponseBase, SmbClient.NtlmHash);
