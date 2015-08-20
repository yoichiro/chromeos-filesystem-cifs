(function(Header, Types, Debug, Constants, Smb1PacketHelper) {
    "use strict";

    // Constructor

    // buffer: ArrayBuffer (except 0x00+Length(3bytes))
    var Packet = function(buffer) {
        this.types_ = new Types();
        this.data_ = null;
        this.dataLength_ = null;
        this.packetHelper_ = null;
        
        if (buffer) {
            this.data_ = buffer;
            this.dataLength_ = buffer.byteLength;
        } else {
            this.data_ = new ArrayBuffer();
            this.dataLength_ = 0;
        }
        
        createPacketHelper.call(this);
    };

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
    
    Packet.prototype.getPacketHelper = function() {
        return this.packetHelper_;
    };
    
    Packet.prototype.setPacketHelper = function(packetHelper) {
        this.packetHelper_ = packetHelper;
    };
    
    Packet.prototype.getHeader = function() {
        return this.packetHelper_.getHeader();
    };
    
    Packet.prototype.getHeaderUint8Array = function() {
        return this.packetHelper_.getHeaderUint8Array();
    };
    
    Packet.prototype.set = function(version, header, request) {
        if (version === Constants.PROTOCOL_VERSION_SMB1) {
            this.packetHelper_ = new Smb1PacketHelper(this);
        } else if (version === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Create Smb2PacketHelper
        } else {
            throw new Error("Invalid version: " + version);
        }
        this.packetHelper_.set(header, request);
    };
    
    Packet.prototype.setData = function(data) {
        this.data_ = data;
        this.dataLength_ = data.byteLength;
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
    
    var createPacketHelper = function() {
        var protocolVersion = this.getSmbProtocolVersion();
        if (protocolVersion === Constants.PROTOCOL_VERSION_SMB1) {
            this.packetHelper_ = new Smb1PacketHelper(this);
        } else if (protocolVersion === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Create Smb2PacketHelper
        }
    };

    // Export

    SmbClient.Packet = Packet;

})(SmbClient.Header,
   SmbClient.Types,
   SmbClient.Debug,
   SmbClient.Constants,
   SmbClient.Smb1.Models.PacketHelper);
