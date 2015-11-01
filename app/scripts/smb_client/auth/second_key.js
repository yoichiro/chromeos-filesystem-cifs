(function(Auth, Base) {
    "use strict";

    // Construtor

    var SecondKey = function() {
        this.base_ = new Base();
    };

    // Public functions

    // key: ArrayBuffer, byteLength: 40 or 56
    SecondKey.prototype.weakenForNtlm1 = function(key, byteLength) {
        var keyArray = new Uint8Array(key);
        var trimed = new Uint8Array(new ArrayBuffer(8));
        if (byteLength === 56) {
            trimed.set(keyArray.subarray(0, 7), 0);
            trimed[7] = 0xa0;
            return trimed.buffer;
        } else if (byteLength === 40) {
            trimed.set(keyArray.subarray(0, 5), 0);
            trimed[5] = 0xe5;
            trimed[6] = 0x38;
            trimed[7] = 0xb0;
            return trimed.buffer;
        } else {
            return key;
        }
    };

    // key: ArrayBuffer, byteLength: 40 or 56
    SecondKey.prototype.weakenForNtlm2 = function(key, byteLength) {
        var keyArray = new Uint8Array(key);
        if (byteLength === 56) {
            var trimed = new Uint8Array(new ArrayBuffer(7));
            trimed.set(keyArray.subarray(0, 7), 0);
            return trimed.buffer;
        } else if (byteLength === 40) {
            trimed = new Uint8Array(new ArrayBuffer(5));
            trimed.set(keyArray.subarray(0, 5), 0);
            return trimed.buffer;
        } else {
            return key;
        }
    };

    // masterKey: ArrayBuffer
    SecondKey.prototype.create = function() {
        //var secondKey = this.base_.createRandomBytes(16);
        var secondKey = (new Uint8Array([0xf0, 0xf0, 0xaa, 0xbb, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb])).buffer;
        return secondKey;
    };

    // secondMasterKey: ArrayBuffer, masterKey: ArrayBuffer
    SecondKey.prototype.encrypt = function(secondMasterKey, masterKey) {
        var secondMasterKeyWordArray = CryptoJS.lib.WordArray.create(secondMasterKey);
        var masterKeyWordArray = CryptoJS.lib.WordArray.create(masterKey);
        var encrypted = CryptoJS.RC4.encrypt(secondMasterKeyWordArray, masterKeyWordArray);
        var buffer = encrypted.ciphertext.toArrayBuffer();
        // This returns the value as ArrayBuffer
        return buffer;
    };

    // Export

    Auth.SecondKey = SecondKey;

})(SmbClient.Auth, SmbClient.Auth.HashResponseBase);
