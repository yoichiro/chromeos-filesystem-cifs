(function(Types, Constants) {
    "use strict";

    // Constructor

    var DceRpc = function() {
        this.types_ = new Types();

        this.packetType_ = null;
        this.callId_ = null;
        this.opnum_ = null;
        this.bodyBuffer_ = null;
    };

    // Public functions

    DceRpc.prototype.setPacketType = function(packetType) {
        this.packetType_ = packetType;
    };

    DceRpc.prototype.getPacketType = function() {
        return this.packetType_;
    };

    DceRpc.prototype.setCallId = function(callId) {
        this.callId_ = callId;
    };

    DceRpc.prototype.setOpnum = function(opnum) {
        this.opnum_ = opnum;
    };

    // buffer: ArrayBuffer
    DceRpc.prototype.setBodyBuffer = function(buffer) {
        this.bodyBuffer_ = buffer;
    };

    DceRpc.prototype.createArrayBuffer = function() {
        var total = 16;
        if (this.packetType_ === Constants.DCERPC_PACKET_TYPE_BIND) {
            total = total +
                2 + // Max Xmit Frag
                2 + // Max Recv Frag
                4 + // Assoc Group
                1 + // Num Cts Items
                3; // Padding
        } else if (this.packetType_ === Constants.DCERPC_PACKET_TYPE_REQUEST) {
            total = total +
                4 + // Alloc hint
                2 + // Context ID
                2; // Opnum
        }
        total += this.bodyBuffer_.byteLength;

        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Version (5.0)
        array[0] = 0x05;
        array[1] = 0x00;
        // Packet type
        array[2] = this.packetType_;
        // Packet Flags
        array[3] = 0x03; // Last Frag | First Frag
        // Data Representation
        this.types_.setFixed4BytesValue(0x00000010, array, 4); // Little Endian
        // Frag Length
        this.types_.setFixed2BytesValue(total, array, 8);
        // Auth Length
        this.types_.setFixed2BytesValue(0, array, 10);
        // Call ID
        this.types_.setFixed4BytesValue(this.callId_, array, 12);

        if (this.packetType_ === Constants.DCERPC_PACKET_TYPE_BIND) {
            // Max Xmit Frag
            this.types_.setFixed2BytesValue(4280, array, 16);
            // Max Recv Frag
            this.types_.setFixed2BytesValue(4280, array, 18);
            // Assoc Group
            this.types_.setFixed4BytesValue(0, array, 20);
            // Num Ctx Items
            array[24] = 1;
            // Body
            this.types_.copyArray(new Uint8Array(this.bodyBuffer_),
                                  array, 28, this.bodyBuffer_.byteLength);
        } else if (this.packetType_ === Constants.DCERPC_PACKET_TYPE_REQUEST) {
            // Alloc hint
            var allocHint = 8 + this.bodyBuffer_.byteLength;
            this.types_.setFixed4BytesValue(allocHint, array, 16);
            // Context ID
            this.types_.setFixed2BytesValue(0, array, 20);
            // Opnum
            this.types_.setFixed2BytesValue(this.opnum_, array, 22);
            // Body
            this.types_.copyArray(new Uint8Array(this.bodyBuffer_),
                                  array, 24, this.bodyBuffer_.byteLength);
        }

        return buffer;
    };

    DceRpc.prototype.load = function(array) {
        this.packetType_ = array[2];
    };

    // Private functions

    // Export

    SmbClient.DceRpc = DceRpc;

})(SmbClient.Types, SmbClient.Constants);
