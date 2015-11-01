(function(Auth) {
    "use strict";

    // Constructor

    var HashResponseBase = function() {
    };

    // Public functions

    // This returns the result as array of Uint8Array.
    HashResponseBase.prototype.divide7BytesArray = function(array) {
        var result = [];
        var offset = 0;
        while (offset < array.length) {
            result.push(array.subarray(offset, (offset + 7)));
            offset += 7;
        }
        return result;
    };

    /*jslint bitwise: true */
    HashResponseBase.prototype.createDesKey = function(array) {
        var result = [];
        var temp = 0;
        var tempPos = 2;
        var parity = 0;
        for (var i = array.length - 1; i >= 0; i--) {
            var target = array[i];
            for (var j = 0; j < 8; j++) {
                var bit = target & 1;
                if (bit === 1) {
                    parity++;
                }
                temp = temp | (bit * tempPos);
                tempPos *= 2;
                if (tempPos === 256) {
                    if (parity % 2 === 0) {
                        temp |= 1;
                    }
                    result.push(temp);
                    temp = 0;
                    tempPos = 2;
                    parity = 0;
                }
                target = target >> 1;
            }
        }
        return new Uint8Array(result.reverse());
    };

    HashResponseBase.prototype.encryptByDes = function(source, key) {
        var keyWordArray = CryptoJS.lib.WordArray.create(key);
        var resultWordArray = CryptoJS.DES.encrypt(source, keyWordArray, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
        });
        // This returns the result as WordArray.
        return resultWordArray.ciphertext;
    };

    HashResponseBase.prototype.createClientNonce = function(byteLength) {
        return this.createRandomBytes(byteLength);
    };

    HashResponseBase.prototype.createRandomBytes = function(byteLength) {
        var buffer = new ArrayBuffer(byteLength);
        var view = new DataView(buffer);
        var pos = 0;
        while (pos < byteLength) {
            var rand = Math.floor((Math.random() * 100000000000) + 1) % 0xffffffff;
            view.setUint32(pos, rand, true);
            pos += 4;
        }
        // This returns the result as ArrayBuffer.
        return buffer;
        //var rand = new Uint8Array([0xff, 0xff, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44]);
        //return rand.buffer;
    };

    // Export

    Auth.HashResponseBase = HashResponseBase;

})(SmbClient.Auth);
