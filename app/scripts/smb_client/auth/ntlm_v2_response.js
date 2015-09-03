(function(Auth, Debug, Base, Types) {
    "use strict";

    // Constructor

    var NtlmV2Response = function() {
        this.base_ = new Base();
        this.types_ = new Types();
    };

    // Public functions

    // ntlmV2Hash: ArrayBuffer, serverChallenge: Uint8Array, targetInformation: Uint8Array
    NtlmV2Response.prototype.create = function(ntlmV2Hash, serverChallenge, targetInformation) {
        var blobArrayBuffer = createBlob.call(this, targetInformation);
        var blobWordArray = CryptoJS.lib.WordArray.create(blobArrayBuffer);
        var serverChallengeWordArray = CryptoJS.lib.WordArray.create(serverChallenge);
        var concated = serverChallengeWordArray.concat(blobWordArray);
        var ntlmV2HashWordArray = CryptoJS.lib.WordArray.create(ntlmV2Hash);
        var hash = CryptoJS.HmacMD5(concated, ntlmV2HashWordArray);
        var response = hash.concat(blobWordArray);
        var buffer = response.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Private functions

    // targetInformation: Uint8Array
    var createBlob = function(targetInformation) {
        var total =
                4 + // Blob signature
                4 + // Reserved
                8 + // Timestamp
                8 + // Client challenge
                4 + // Reserved
                targetInformation.length +
                4; // Reserved.
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        var view = new DataView(buffer);

        view.setUint32(0, 0x01010000, false);

        var date = getCurrentSmbTime.call(this);
        this.types_.setFixed4BytesValue(date.low, array, 8);
        this.types_.setFixed4BytesValue(date.high, array, 12);

        setClientChallenge.call(this, array);
        this.types_.copyArray(targetInformation, array, 28, targetInformation.length);

        // This returns the result as ArrayBuffer.
        return buffer;
    };

    var getCurrentSmbTime = function() {
        return this.types_.getSmbTimeFromDate(new Date());
        //var date = new Date(1055844000000);
        //return this.types_.getSmbTimeFromDate(date);
    };

    // array: Uint8Array
    var setClientChallenge = function(array) {
        var rand = Math.floor((Math.random() * 10000000000000) + 1);
        this.types_.setFixed8BytesValue(rand, array, 16);
        //var rand = new Uint8Array([0xff, 0xff, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44]);
        //this.types_.copyArray(rand, array, 16, 8);
    };

    // Export

    Auth.NtlmV2Response = NtlmV2Response;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Auth.HashResponseBase, SmbClient.Types);
