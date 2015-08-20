(function(Models, Header, Types, Debug) {
    "use strict";
    
    // Constructor
    
    var PacketHelper = function(packet) {
        this.types_ = new Types();

        this.packet_ = packet;
        this.packet_.setPacketHelper(this);
    };
    
    // Constants

    PacketHelper.HEADER_LENGTH = 32; // bytes
    
    // Public functions
    
    PacketHelper.prototype.getHeaderUint8Array = function() {
        var array = new Uint8Array(this.packet_.getData());
        var subarray = array.subarray(0, PacketHelper.HEADER_LENGTH);
        // This returns the result as Uint8Array.
        return subarray;
    };

    PacketHelper.prototype.getHeader = function() {
        var header = new Header();
        header.load(this.packet_);
        return header;
    };

    PacketHelper.prototype.getSmbParametersAndSmbDataUint8Array = function() {
        var array = new Uint8Array(this.packet_.getData());
        var subarray = array.subarray(PacketHelper.HEADER_LENGTH,
                                      this.packet_.getDataByteLength());
        // This returns the result as Uint8Array.
        return subarray;
    };
    
    PacketHelper.prototype.set = function(header, request) {
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

        this.packet_.setData(buffer);
    };
    
    // Export
    
    Models.PacketHelper = PacketHelper;
    
})(SmbClient.Smb1.Models, SmbClient.Smb1.Models.Header, SmbClient.Types, SmbClient.Debug);
