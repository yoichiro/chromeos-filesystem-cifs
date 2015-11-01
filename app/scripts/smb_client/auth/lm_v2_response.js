(function(Auth, Debug, Base, Types) {
    "use strict";

    // Constructor

    var LmV2Response = function() {
        this.base_ = new Base();
        this.types_ = new Types();

        // For calculating User Session Key
        this.ntlmV2Hash_ = null;
        this.hash_ = null;
    };

    // Public functions

    // ntlmV2Hash: ArrayBuffer, serverChallenge: Uint8Array
    LmV2Response.prototype.create = function(ntlmV2Hash, serverChallenge) {
        this.ntlmV2Hash_ = ntlmV2Hash;

        var clientNonceBuffer = this.base_.createClientNonce(8);
        var serverChallengeWordArray = CryptoJS.lib.WordArray.create(serverChallenge);
        var clientNonceWordArray = CryptoJS.lib.WordArray.create(clientNonceBuffer);
        var concated = serverChallengeWordArray.concat(clientNonceWordArray);
        var ntlmV2HashWordArray = CryptoJS.lib.WordArray.create(ntlmV2Hash);
        this.hash_ = CryptoJS.HmacMD5(concated, ntlmV2HashWordArray);
        var response = this.hash_.concat(clientNonceWordArray);
        var buffer = response.toArrayBuffer();

        // This returns the result as ArrayBuffer.
        return buffer;
    };

    LmV2Response.prototype.getLmV2UserSessionKey = function() {
        var ntlmV2HashWordArray = CryptoJS.lib.WordArray.create(this.ntlmV2Hash_);
        var lmV2UserSessionKeyWordArray = CryptoJS.HmacMD5(this.hash_, ntlmV2HashWordArray);
        var lmV2UserSessionKeyBuffer = lmV2UserSessionKeyWordArray.toArrayBuffer();

        // This returns the result as ArrayBuffer.
        return lmV2UserSessionKeyBuffer;
    };

    // Export

    Auth.LmV2Response = LmV2Response;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Auth.HashResponseBase, SmbClient.Types);
