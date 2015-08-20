(function(Auth, Debug, Types, BinaryUtils, Base) {
    "use strict";

    // Constructor

    var LmHash = function() {
        this.types_ = new Types();
        this.lmBase_ = new Base();
        this.binaryUtils_ = new BinaryUtils();
        this.fixedString_ = "KGS!@#$%";
    };

    // Public functions

    LmHash.prototype.create = function(password) {
        var upperCasePassword = password.toUpperCase();
        var upperCasePasswordBuffer = this.types_.createSimpleStringArrayBuffer(upperCasePassword);
        var adjustedUpperCasePasswordArray = adjustPasswordLength.call(this, upperCasePasswordBuffer);
        var divided = this.lmBase_.divide7BytesArray.call(this, adjustedUpperCasePasswordArray);
        var desKey1 = this.lmBase_.createDesKey.call(this, divided[0]);
        var desKey2 = this.lmBase_.createDesKey.call(this, divided[1]);
        var hash1WordArray = this.lmBase_.encryptByDes.call(this, this.fixedString_, desKey1);
        var hash2WordArray = this.lmBase_.encryptByDes.call(this, this.fixedString_, desKey2);
        var concated = hash1WordArray.concat(hash2WordArray);
        var buffer = concated.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return buffer;
    };

    // Private functions

    // This return the result as Uint8Array.
    var adjustPasswordLength = function(upperCasePasswordBuffer) {
        var array = new Uint8Array(upperCasePasswordBuffer);
        if (array.length === 14) {
            return array;
        } else if (14 < array.length) {
            return array.subarray(0, 13);
        } else { // array.length < 14
            var newArray = new Uint8Array(14);
            newArray.set(array, 0);
            return newArray;
        }
    };

    // Export

    Auth.LmHash = LmHash;

})(SmbClient.Auth, SmbClient.Debug, SmbClient.Types, SmbClient.BinaryUtils, SmbClient.Auth.HashResponseBase);
