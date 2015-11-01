(function(Auth, Debug, Base) {
    "use strict";

    // Constructor

    var LmResponse = function() {
        this.lmBase_ = new Base();

        // For calculating of User Session Key
        this.hash_ = null;
        this.lmResponse_ = null;
    };

    // Public functions

    // hash: ArrayBuffer, serverChallenge: Uint8Array
    LmResponse.prototype.create = function(hash, serverChallenge) {
        this.hash_ = hash;

        var padded = pad21Bytes.call(this, hash);
        var divided = this.lmBase_.divide7BytesArray(padded);
        var desKey1 = this.lmBase_.createDesKey(divided[0]);
        var desKey2 = this.lmBase_.createDesKey(divided[1]);
        var desKey3 = this.lmBase_.createDesKey(divided[2]);
        var encrypted1 = this.lmBase_.encryptByDes(
            CryptoJS.lib.WordArray.create(serverChallenge), desKey1);
        var encrypted2 = this.lmBase_.encryptByDes(
            CryptoJS.lib.WordArray.create(serverChallenge), desKey2);
        var encrypted3 = this.lmBase_.encryptByDes(
            CryptoJS.lib.WordArray.create(serverChallenge), desKey3);
        var concated = (encrypted1.concat(encrypted2)).concat(encrypted3);
        this.lmResponse_ = concated.toArrayBuffer();

        // This returns the result as ArrayBuffer
        return this.lmResponse_;
    };

    LmResponse.prototype.getLmUserSessionKey = function() {
        var lmHashArray = new Uint8Array(this.hash_);
        var lmHash8bytes = lmHashArray.subarray(0, 8);
        var lmUserSessionKeyBuffer = new ArrayBuffer(16);
        var lmUserSessionKeyArray = new Uint8Array(lmUserSessionKeyBuffer);
        lmUserSessionKeyArray.set(lmHash8bytes, 0);
        // This returns the result as ArrayBuffer
        return lmUserSessionKeyBuffer;
    };

    LmResponse.prototype.getNtlmUserSessionKey = function() {
        var ntlmHashWordArray = CryptoJS.lib.WordArray.create(this.hash_);
        var ntlmUserSessionKeyWordArray = CryptoJS.MD4(ntlmHashWordArray);
        var ntlmUserSessionKeyBuffer = ntlmUserSessionKeyWordArray.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return ntlmUserSessionKeyBuffer;
    };

    LmResponse.prototype.getLanManagerSessionKey = function() {
        var hashArray = new Uint8Array(this.hash_);
        var hash8Bytes = hashArray.subarray(0, 8);
        var padding = new Uint8Array(new ArrayBuffer(14));
        padding.set(hash8Bytes, 0);
        var appendedArray = new Uint8Array([0xbd, 0xbd, 0xbd, 0xbd, 0xbd, 0xbd]);
        padding.set(appendedArray, 8);
        var divided = this.lmBase_.divide7BytesArray.call(this, padding);
        var desKey1 = this.lmBase_.createDesKey.call(this, divided[0]);
        var desKey2 = this.lmBase_.createDesKey.call(this, divided[1]);
        var lmResponseArray = new Uint8Array(this.lmResponse_).subarray(0, 8);
        var encrypted1 = this.lmBase_.encryptByDes.call(
            this, CryptoJS.lib.WordArray.create(lmResponseArray), desKey1);
        var encrypted2 = this.lmBase_.encryptByDes.call(
            this, CryptoJS.lib.WordArray.create(lmResponseArray), desKey2);
        var concated = encrypted1.concat(encrypted2);
        var buffer = concated.toArrayBuffer();

        // This returns the result as ArrayBuffer
        return buffer;
    };

    // Private functions

    // This return the result as Uint8Array.
    var pad21Bytes = function(lmHash) {
        var array = new Uint8Array(lmHash);
        var newArray = new Uint8Array(21);
        newArray.set(array, 0);
        return newArray;
    };

    // Export

    Auth.LmResponse = LmResponse;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Auth.HashResponseBase);
