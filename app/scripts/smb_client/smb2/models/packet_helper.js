(function(Models, Header, Types, Debug) {
    "use strict";
    
    // Constructor
    
    var PacketHelper = function(packet) {
        this.types_ = new Types();

        this.packet_ = packet;
        this.packet_.setPacketHelper(this);
    };
    
    // Public functions
    
    PacketHelper.prototype.getHeaderUint8Array = function() {
        var array = new Uint8Array(this.packet_.getData());
        var structureSize = this.types_.getFixed2BytesValue(array, 4);
        var subarray = array.subarray(0, structureSize);
        // This returns the result as Uint8Array.
        return subarray;
    };

    PacketHelper.prototype.getHeader = function() {
        var header = new Header();
        header.load(this.packet_);
        return header;
    };

    // This result includes the structure_size value.
    PacketHelper.prototype.getSmbDataUint8Array = function() {
        var array = new Uint8Array(this.packet_.getData());
        var header = this.getHeader();
        var subarray = array.subarray(header.getStructureSize(),
                                      this.packet_.getDataByteLength());
        // This returns the result as Uint8Array.
        return subarray;
    };
    
    PacketHelper.prototype.set = function(header, request) {
        Debug.log(header);
        Debug.log(request);
        var headerArrayBuffer = header.createArrayBuffer();
        var smbDataArrayBuffer = request.createArrayBuffer();
        var totalSize =
                headerArrayBuffer.byteLength +
                smbDataArrayBuffer.byteLength;
        var buffer = new ArrayBuffer(totalSize);

        // Copy header
        var array = new Uint8Array(buffer);
        var headerArray = new Uint8Array(headerArrayBuffer);
        array.set(headerArray, 0);

        // Copy SMB Data
        var pos = headerArrayBuffer.byteLength;
        array.set(new Uint8Array(smbDataArrayBuffer), pos);

        this.packet_.setData(buffer);
    };
    
    // Export
    
    Models.PacketHelper = PacketHelper;
    
})(SmbClient.Smb2.Models, SmbClient.Smb2.Models.Header, SmbClient.Types, SmbClient.Debug);
