/*jslint bitwise: true */
(function(BinaryUtils) {
    "use strict";

    // Constructor

    var Types = function() {
        this.binaryUtils = new BinaryUtils();
    };

    // Constants
    var MILLISECONDS_BETWEEN_1970_AND_1601 = 11644473600000;

    // Public methods


    // --- For String

    // array: Uint8Array
    Types.prototype.getFixedLengthString = function(array, offset, length) {
        var targetBuffer = new Uint8Array(array.subarray(offset, offset + length));
        var result = this.binaryUtils.arrayBufferToString(targetBuffer.buffer);
        return result;
    };

    // array: Uint8Array
    Types.prototype.getNullEndString = function(array, offset) {
        for (var pos = offset; pos < array.length; pos++) {
            if (array[pos] === 0) {
                break;
            }
        }
        var targetBuffer = new Uint8Array(array.subarray(offset, pos));
        var result = this.binaryUtils.arrayBufferToString(targetBuffer.buffer);
        return {result: result, nextPosition: pos + 1};
    };

    // array: Uint8Array
    Types.prototype.getUnicodeNullEndString = function(array, offset) {
        for (var pos = offset; pos < array.length; pos += 2) {
            if ((array[pos] === 0) && (array[pos + 1] === 0)) {
                break;
            }
        }
        var targetBuffer = new Uint8Array(array.subarray(offset, pos - 1));
        var targetWordArray = CryptoJS.lib.WordArray.create(targetBuffer);
        var result = CryptoJS.enc.Utf16LE.stringify(targetWordArray);
        return {result: result, nextPosition: pos + 2};
    };

    // array: Uint8Array
    Types.prototype.getFixedLengthUnicodeString = function(array, offset, length) {
        var targetBuffer = new Uint8Array(array.subarray(offset, offset + length));
        var targetWordArray = CryptoJS.lib.WordArray.create(targetBuffer);
        var result = CryptoJS.enc.Utf16LE.stringify(targetWordArray);
        return {result: result, nextPosition: offset + length};
    };

    // source: String
    Types.prototype.createSimpleStringArrayBuffer = function(source) {
        // This returns the result as ArrayBuffer.
        return this.binaryUtils.stringToArrayBuffer(source);
    };

    // source: String
    Types.prototype.createUnicodeString = function(source) {
        var uniSourceWordArray = CryptoJS.enc.Utf16LE.parse(source);
        var uniSourceArrayBuffer = uniSourceWordArray.toArrayBuffer();
        // This returns the result as ArrayBuffer.
        return uniSourceArrayBuffer;
    };

    // source: string, array: Uint8Array
    Types.prototype.setSimpleStringTo = function(source, array, offset) {
        var sourceBuffer = this.createSimpleStringArrayBuffer(source);
        var sourceArray = new Uint8Array(sourceBuffer);
        this.copyArray(sourceArray, array, offset, sourceBuffer.byteLength);
    };

    // source: string, array: Uint8Array
    Types.prototype.setSimpleNullEndStringTo = function(source, array, offset) {
        var sourceBuffer = this.createSimpleStringArrayBuffer(source);
        var sourceArray = new Uint8Array(sourceBuffer);
        this.copyArray(sourceArray, array, offset, sourceBuffer.byteLength);
        array[offset + sourceBuffer.byteLength] = 0;
    };

    Types.prototype.setUnicodeNullEndString = function(source, array, offset) {
        var uniSourceWordArray = CryptoJS.enc.Utf16LE.parse(source);
        var uniSourceArrayBuffer = uniSourceWordArray.toArrayBuffer();
        var uniSourceArray = new Uint8Array(uniSourceArrayBuffer);
        this.copyArray(uniSourceArray, array, offset, uniSourceArray.length);
        this.setFixed2BytesValue(0, array, offset + uniSourceArray.length); // null terminated.
        // Return the next position.
        return offset + uniSourceArray.length + 2;
    };

    // source: String
    Types.prototype.createDialectStringArrayBuffer = function(dialect) {
        var dialectArrayBuffer = this.binaryUtils.stringToArrayBuffer(dialect);
        var buffer = new ArrayBuffer(1 + dialectArrayBuffer.byteLength + 1);
        var array = new Uint8Array(buffer);
        array[0] = 0x02;
        var dialectArray = new Uint8Array(dialectArrayBuffer);
        array.set(dialectArray, 1);
        array[1 + dialectArray.length] = 0x00; // null terminated.
        // This returns the result as ArrayBuffer.
        return buffer;
    };


    // --- For Fixed length value

    // array: Uint8Array
    Types.prototype.getFixed2BytesValue = function(array, offset) {
        var copied = new Uint8Array(array);
        var view = new DataView(copied.buffer);
        var result = view.getUint16(offset, true);
        return result;
    };

    // array: Uint8Array
    Types.prototype.getFixed2BytesSignedValue = function(array, offset) {
        var copied = new Uint8Array(array);
        var view = new DataView(copied.buffer);
        var result = view.getInt16(offset, true);
        return result;
    };

    // array: Uint8Array
    Types.prototype.getFixed4BytesValue = function(array, offset) {
        var copied = new Uint8Array(array);
        var view = new DataView(copied.buffer);
        var result = view.getUint32(offset, true);
        return result;
    };

    Types.prototype.getFixed8BytesValue = function(array, offset) {
        var low = this.getFixed4BytesValue(array, offset);
        var high = this.getFixed4BytesValue(array, offset + 4);
        return high * Math.pow(2, 32) + low;
    };

    // array: Unit8Array
    Types.prototype.setFixed2BytesValue = function(value, array, offset) {
        var view = new DataView(array.buffer);
        view.setUint16(offset, value, true);
        return offset + 2;
    };

    // array: Unit8Array
    Types.prototype.setFixed4BytesValue = function(value, array, offset) {
        var view = new DataView(array.buffer);
        view.setUint32(offset, value, true);
        return offset + 4;
    };

    // array: Unit8Array
    Types.prototype.setFixedSigned4BytesValue = function(value, array, offset) {
        var view = new DataView(array.buffer);
        view.setInt32(offset, value, true);
        return offset + 4;
    };

    // array: Unit8Array
    Types.prototype.setFixed8BytesValue = function(value, array, offset) {
        var divided = this.divide8BytesValue(value);
        this.setFixed4BytesValue(divided.low, array, offset);
        this.setFixed4BytesValue(divided.high, array, offset + 4);
        return offset + 8;
    };
    
    /*jslint bitwise: true */
    Types.prototype.divide8BytesValue = function(value) {
        var low = (value & 0xffffffff) >>> 0;
        var high = Math.floor(value / Math.pow(2, 32));
        return {
            low: low,
            high: high
        };
    };

    // --- For Copy, Fill

    // array: Uint8Array
    Types.prototype.fillInFixedValue = function(value, array, offset, length) {
        for (var i = offset; i < offset + length; i++) {
            array[i] = value;
        }
    };

    // source: Uint8Array, target: Uint8Array
    Types.prototype.copyArray = function(source, target, offset, length) {
        for (var i = 0; i < length; i++) {
            target[i + offset] = source[i];
        }
    };


    // --- For Date

    // array: Uint8Array
    Types.prototype.getDateFromArray = function(array, offset) {
        var low = this.getFixed4BytesValue(array, offset);
        var high = this.getFixed4BytesValue(array, offset + 4);
        return this.getDateFromSmbTime(high, low);
    };

    // high, low: integer
    Types.prototype.getDateFromSmbTime = function(high, low) {
        var highBigInt = bigInt(high);
        var lowBigInt = bigInt(low);
        var shifted = highBigInt.shiftLeft(32);
        var anded = lowBigInt.and(0xFFFFFFFF);
        var ored = shifted.or(anded);
        var result = new Date(ored.divide(10000) - MILLISECONDS_BETWEEN_1970_AND_1601);
        // This returns the resule as Date.
        return result;
    };

    Types.prototype.getSmbTimeFromDate = function(date) {
        var time = bigInt(date.getTime());
        var ored = time.add(MILLISECONDS_BETWEEN_1970_AND_1601).multiply(10000);
        var low = ored.and(0xFFFFFFFF);
        var high = ored.shiftRight(32);
        return {
            high: high.toJSNumber(),
            low: low.toJSNumber()
        };
    };

    // --- For Padding

    Types.prototype.getPaddingLength = function(offset, boundary) {
        var m = boundary - 1;
        var i = offset;
        var n = ((i + m) & ~m) - i;
        return n;
    };


    // Export

    SmbClient.Types = Types;

})(SmbClient.BinaryUtils);
