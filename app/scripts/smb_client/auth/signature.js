(function(Auth, CRC32, Types, Base, Debug) {
    "use strict";

    // Constructor

    var Signature = function() {
        this.crc32_ = new CRC32();
        this.types_ = new Types();
        this.base_ = new Base();
    };

    // Public functions

    // message: ArrayBuffer
    Signature.prototype.calculateForNtlm1 = function(negotiatedKey, message, sequenceNumber) {
        var checksum = this.crc32_.calculate(message);

        var targetArray = new Uint8Array(new ArrayBuffer(12));
        this.types_.setFixed4BytesValue(0, targetArray, 0);
        this.types_.setFixed4BytesValue(checksum, targetArray, 4);
        this.types_.setFixed4BytesValue(sequenceNumber, targetArray, 8);

        var negotiatedKeyWordArray = CryptoJS.lib.WordArray.create(negotiatedKey);
        var targetWordArray = CryptoJS.lib.WordArray.create(targetArray);
        var encryptedWordArray = CryptoJS.RC4.encrypt(targetWordArray, negotiatedKeyWordArray);
        var encryptedBuffer = encryptedWordArray.ciphertext.toArrayBuffer();
        var encryptedArray = new Uint8Array(encryptedBuffer);

        var randomBytesBuffer = this.base_.createRandomBytes(4);
        var randomBytesArray = new Uint8Array(randomBytesBuffer);
        //var randomBytesArray = new Uint8Array([0x78, 0x01, 0x09, 0x00]);
        this.types_.copyArray(randomBytesArray, encryptedArray, 0, 4);

        var resultArray = new Uint8Array(new ArrayBuffer(4 + encryptedArray.length));
        this.types_.setFixed4BytesValue(1, resultArray, 0);
        this.types_.copyArray(encryptedArray, resultArray, 4, encryptedArray.length);

        // This returns the value as ArrayBuffer
        return resultArray.buffer;
    };

    Signature.prototype.calculateForNtlm2 = function(
        clientSigningKey, clientSealingKey, message, sequenceNumber) {
        var concatenatedBuffer = new ArrayBuffer(4 + message.byteLength);
        var concatenatedArray = new Uint8Array(concatenatedBuffer);
        this.types_.setFixed4BytesValue(sequenceNumber, concatenatedArray, 0);
        this.types_.copyArray(new Uint8Array(message), concatenatedArray, 4, message.byteLength);

        var concatenatedWordArray = CryptoJS.lib.WordArray.create(concatenatedBuffer);
        var clientSigningKeyWordArray = CryptoJS.lib.WordArray.create(clientSigningKey);
        var hashWordArray = CryptoJS.HmacMD5(concatenatedWordArray, clientSigningKeyWordArray);
        var hashArray = new Uint8Array(hashWordArray.toArrayBuffer());

        var clientSealingKeyWordArray = CryptoJS.lib.WordArray.create(clientSealingKey);
        var hash8BytesArray = new Uint8Array(hashArray.subarray(0, 8));
        var hash8BytesWordArray = CryptoJS.lib.WordArray.create(hash8BytesArray);
        var encrypted = CryptoJS.RC4.encrypt(hash8BytesWordArray, clientSealingKeyWordArray);
        var encryptedArray = new Uint8Array(encrypted.ciphertext.toArrayBuffer());

        var resultArray = new Uint8Array(new ArrayBuffer(4 + encryptedArray.length + 4));
        this.types_.setFixed4BytesValue(1, resultArray, 0);
        this.types_.copyArray(encryptedArray, resultArray, 4, encryptedArray.length);
        this.types_.setFixed4BytesValue(sequenceNumber, resultArray, 4 + encryptedArray.length);
        // This returns the result as ArrayBuffer
        return resultArray.buffer;
    };

    // Export

    Auth.Signature = Signature;

})(SmbClient.Auth, SmbClient.Auth.CRC32, SmbClient.Types, SmbClient.Auth.HashResponseBase, SmbClient.Debug);
