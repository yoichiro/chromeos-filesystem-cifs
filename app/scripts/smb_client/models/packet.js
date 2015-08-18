(function(Header, Types, Debug, Constants) {
    "use strict";

    // Constructor

    // buffer: ArrayBuffer (except 0x00+Length(3bytes))
    var Packet = function(buffer) {
        this.types_ = new Types();
        this.data_ = null;
        this.dataLength_ = null;
        if (buffer) {
            this.data_ = buffer;
            this.dataLength_ = buffer.byteLength;
        } else {
            this.data_ = new ArrayBuffer();
            this.dataLength_ = 0;
        }
    };

    // Constants

    Packet.HEADER_LENGTH = 32; // bytes

    // Public methods

    Packet.prototype.createArrayBuffer = function() {
        var result = new ArrayBuffer(4 + this.dataLength_);
        var dataLengthArray = createPacketLengthArray(this.dataLength_);
        var view = new Uint8Array(result);
        view.set(dataLengthArray, 0);
        view.set(new Uint8Array(this.data_), 4);
        // This returns the result as ArrayBuffer.
        return result;
    };

    Packet.prototype.getData = function() {
        // This returns the result as ArrayBuffer.
        return this.data_;
    };

    Packet.prototype.getDataByteLength = function() {
        return this.dataLength_;
    };

    Packet.prototype.getSmbProtocolVersion = function() {
        if (this.dataLength_ > 0) {
            var array = new Uint8Array(this.data_);
            if (array[0] === 0xff) {
                return Constants.PROTOCOL_VERSION_SMB1;
            } else if (array[0] === 0xfe) {
                return Constants.PROTOCOL_VERSION_SMB2;
            } else {
                return Constants.PROTOCOL_VERSION_UNKNOWN;
            }
        } else {
            return Constants.PROTOCOL_VERSION_UNKNOWN;
        }
    };

    Packet.prototype.getHeaderUint8Array = function() {
        var array = new Uint8Array(this.data_);
        var subarray = array.subarray(0, Packet.HEADER_LENGTH);
        // This returns the result as Uint8Array.
        return subarray;
    };

    Packet.prototype.getHeader = function() {
        var header = new Header();
        header.load(this);
        return header;
    };

    Packet.prototype.getSmbParametersAndSmbDataUint8Array = function() {
        var array = new Uint8Array(this.data_);
        var subarray = array.subarray(Packet.HEADER_LENGTH,
                                      this.dataLength_);
        // This returns the result as Uint8Array.
        return subarray;
    };

    Packet.prototype.set = function(header, request) {
        Debug.log(header);
        Debug.log(request);
        var headerArrayBuffer = header.createArrayBuffer();
        var smbParametersArrayBuffer = request.createSmbParametersArrayBuffer();
        var smbDataArrayBuffer = request.createSmbDataArrayBuffer();
        var totalSize =
                headerArrayBuffer.byteLength +
                1 + // Word count
                smbParametersArrayBuffer.byteLength +
                2 + // Byte count
                smbDataArrayBuffer.byteLength;
        var buffer = new ArrayBuffer(totalSize);

        // Copy header
        var array = new Uint8Array(buffer);
        var headerArray = new Uint8Array(headerArrayBuffer);
        array.set(headerArray, 0);

        // Copy SMB Parameters
        if (smbParametersArrayBuffer.byteLength > 0) {
            array[32] = smbParametersArrayBuffer.byteLength / 2;
            var smbParametersArray = new Uint8Array(smbParametersArrayBuffer);
            array.set(smbParametersArray, 33);
        } else {
            array[32] = 0;
        }

        // Copy SMB Data
        var pos = 32 + 1 + smbParametersArrayBuffer.byteLength;
        this.types_.setFixed2BytesValue(smbDataArrayBuffer.byteLength, array, pos);
        pos += 2;
        var smbDataArray = new Uint8Array(smbDataArrayBuffer);
        array.set(smbDataArray, pos);

        this.data_ = buffer;
        this.dataLength_ = buffer.byteLength;
    };

    // Private methods

    var createPacketLengthArray = function(value) {
        var buffer = new ArrayBuffer(4);
        var view = new DataView(buffer);
        view.setUint32(0, value, false);
        var array = new Uint8Array(buffer);
        array[0] = 0; // 0x123456 -> 0x003456
        // This returns the result as Uint8Array.
        return array;
    };

    // Export

    SmbClient.Packet = Packet;

})(SmbClient.Header, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
