(function(Auth, Debug, Base, Types) {
    "use strict";

    // Constructor

    var Ntlm2SessionResponse = function() {
        this.base_ = new Base();
        this.types_ = new Types();

        // For calculating User Session Key
        this.htmlHashBuffer_ = null;
        this.sessionNonceWordArray_ = null;
    };

    // Public functions

    // password: String, serverChallenge: Uint8Array
    Ntlm2SessionResponse.prototype.create = function(password, serverChallenge) {
        var clientNonceBuffer = this.base_.createClientNonce(8);
        var lmResponseBuffer = paddingNullBytes.call(this, clientNonceBuffer, 24);

        var serverChallengeWordArray = CryptoJS.lib.WordArray.create(serverChallenge);
        var clientNonceWordArray = CryptoJS.lib.WordArray.create(clientNonceBuffer);
        this.sessionNonceWordArray_ = serverChallengeWordArray.concat(clientNonceWordArray);
        var md5 = CryptoJS.MD5(this.sessionNonceWordArray_);
        var md5Buffer = md5.toArrayBuffer();
        var ntlm2SessionHash = trim8Bytes.call(this, md5Buffer);

        var unicodePasswordBuffer = this.types_.createUnicodeString(password);
        var unicodePasswordWordArray = CryptoJS.lib.WordArray.create(unicodePasswordBuffer);
        var ntlmHashWordArray = CryptoJS.MD4(unicodePasswordWordArray);
        this.ntlmHashBuffer_ = ntlmHashWordArray.toArrayBuffer();

        var padded = paddingNullBytes.call(this, this.ntlmHashBuffer_, 21);
        var divided = this.base_.divide7BytesArray(new Uint8Array(padded));
        var desKey1 = this.base_.createDesKey(divided[0]);
        var desKey2 = this.base_.createDesKey(divided[1]);
        var desKey3 = this.base_.createDesKey(divided[2]);
        var ntlm2SessionHashWordArray = CryptoJS.lib.WordArray.create(ntlm2SessionHash);
        var hash1WordArray = this.base_.encryptByDes.call(this, ntlm2SessionHashWordArray, desKey1);
        var hash2WordArray = this.base_.encryptByDes.call(this, ntlm2SessionHashWordArray, desKey2);
        var hash3WordArray = this.base_.encryptByDes.call(this, ntlm2SessionHashWordArray, desKey3);
        var concatedHashWordArray = (hash1WordArray.concat(hash2WordArray)).concat(hash3WordArray);
        var ntlm2SessionResponseBuffer = concatedHashWordArray.toArrayBuffer();

        // This returns two values as ArrayBuffer.
        return {
            lmResponse: lmResponseBuffer,
            ntlmResponse: ntlm2SessionResponseBuffer
        };
    };

    Ntlm2SessionResponse.prototype.getNtlm2SessionResponseUserSessionKey = function() {
        var ntlmHashWordArray = CryptoJS.lib.WordArray.create(this.ntlmHashBuffer_);
        var ntlmUserSessionKeyWordArray = CryptoJS.MD4(ntlmHashWordArray);
        var userSessionKeyWordArray = CryptoJS.HmacMD5(
            this.sessionNonceWordArray_, ntlmUserSessionKeyWordArray);
        // This returns two values as ArrayBuffer.
        return userSessionKeyWordArray.toArrayBuffer();
    };

    // Private functions

    var paddingNullBytes = function(buffer, length) {
        var newBuffer = new ArrayBuffer(length);
        var newArray = new Uint8Array(newBuffer);
        newArray.set(new Uint8Array(buffer), 0);
        return newBuffer;
    };

    var trim8Bytes = function(buffer) {
        var array = new Uint8Array(buffer);
        return array.subarray(0, 8);
    };

    // Export

    Auth.Ntlm2SessionResponse = Ntlm2SessionResponse;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Auth.HashResponseBase, SmbClient.Types);
