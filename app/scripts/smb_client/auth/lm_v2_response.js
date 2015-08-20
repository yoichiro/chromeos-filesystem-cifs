(function(Debug, Base, Types) {
    "use strict";

    // Constructor

    var LmV2Response = function() {
        this.base_ = new Base();
        this.types_ = new Types();
    };

    // Public functions

    // ntlmV2Hash: ArrayBuffer, serverChallenge: Uint8Array
    LmV2Response.prototype.create = function(ntlmV2Hash, serverChallenge) {
        var clientNonceBuffer = this.base_.createClientNonce.call(this);
        var serverChallengeWordArray = CryptoJS.lib.WordArray.create(serverChallenge);
        var clientNonceWordArray = CryptoJS.lib.WordArray.create(clientNonceBuffer);
        var concated = serverChallengeWordArray.concat(clientNonceWordArray);
        var ntlmV2HashWordArray = CryptoJS.lib.WordArray.create(ntlmV2Hash);
        var hash = CryptoJS.HmacMD5(concated, ntlmV2HashWordArray);
        var response = hash.concat(clientNonceWordArray);
        var buffer = response.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Export

    SmbClient.LmV2Response = LmV2Response;

})(SmbClient.Debug, SmbClient.HashResponseBase, SmbClient.Types);
