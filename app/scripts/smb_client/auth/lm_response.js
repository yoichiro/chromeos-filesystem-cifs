(function(Debug, Base) {
    "use strict";

    // Constructor

    var LmResponse = function() {
        this.lmBase_ = new Base();
    };

    // Public functions

    // lmHash: ArrayBuffer, serverChallenge: Uint8Array
    LmResponse.prototype.create = function(lmHash, serverChallenge) {
        var padded = pad21Bytes.call(this, lmHash);
        var divided = this.lmBase_.divide7BytesArray.call(this, padded);
        var desKey1 = this.lmBase_.createDesKey.call(this, divided[0]);
        var desKey2 = this.lmBase_.createDesKey.call(this, divided[1]);
        var desKey3 = this.lmBase_.createDesKey.call(this, divided[2]);
        var encrypted1 = this.lmBase_.encryptByDes.call(this, CryptoJS.lib.WordArray.create(serverChallenge), desKey1);
        var encrypted2 = this.lmBase_.encryptByDes.call(this, CryptoJS.lib.WordArray.create(serverChallenge), desKey2);
        var encrypted3 = this.lmBase_.encryptByDes.call(this, CryptoJS.lib.WordArray.create(serverChallenge), desKey3);
        var concated = (encrypted1.concat(encrypted2)).concat(encrypted3);
        var buffer = concated.toArrayBuffer();
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

    SmbClient.LmResponse = LmResponse;

})(SmbClient.Debug, SmbClient.HashResponseBase);
