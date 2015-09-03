(function(Types, DceRpc, Constants, Debug) {
    "use strict";

    // Constructor

    var DceRpcBind = function() {
        this.types_ = new Types();

        this.fid_ = null;
    };

    // Public functions

    // fid: Number
    DceRpcBind.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    DceRpcBind.prototype.createTransactionParameter = function() {
        return null;
    };

    DceRpcBind.prototype.createTransactionData = function() {
        var rpc = new DceRpc();

        rpc.setPacketType(Constants.DCERPC_PACKET_TYPE_BIND);
        rpc.setCallId(1);

        var total = 44;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Context ID
        this.types_.setFixed2BytesValue(0, array, 0);
        // Num Trans Items
        array[2] = 0x01;
        // Interface (SRVSVC UUID)
        this.types_.setFixed4BytesValue(0x4b324fc8, array, 4);
        this.types_.setFixed2BytesValue(0x1670, array, 8);
        this.types_.setFixed2BytesValue(0x01d3, array, 10);
        this.types_.copyArray(new Uint8Array([0x12, 0x78]), array, 12, 2);
        this.types_.copyArray(new Uint8Array(
            [0x5a, 0x47, 0xbf, 0x6e, 0xe1, 0x88]), array, 14, 6);
        // Interface Ver (3.0)
        this.types_.setFixed2BytesValue(0x03, array, 20);
        this.types_.setFixed2BytesValue(0x00, array, 22);
        // Transfer Syntax
        this.types_.setFixed4BytesValue(0x8a885d04, array, 24);
        this.types_.setFixed2BytesValue(0x1ceb, array, 28);
        this.types_.setFixed2BytesValue(0x11c9, array, 30);
        this.types_.copyArray(new Uint8Array([0x9f, 0xe8]), array, 32, 2);
        this.types_.copyArray(new Uint8Array(
            [0x08, 0x00, 0x2b, 0x10, 0x48, 0x60]), array, 34, 6);
        this.types_.setFixed4BytesValue(2, array, 40);

        rpc.setBodyBuffer(buffer);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(rpc.createArrayBuffer());
    };

    DceRpcBind.prototype.createTransactionSetup = function() {
        var buffer = new ArrayBuffer(4);
        var array = new Uint8Array(buffer);

        // TransactNmPipe
        this.types_.setFixed2BytesValue(0x0026, array, 0);
        // FID
        this.types_.setFixed2BytesValue(this.fid_, array, 2);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    // Export

    DceRpc.DceRpcBind = DceRpcBind;

})(SmbClient.Types, SmbClient.DceRpc, SmbClient.Constants, SmbClient.Debug);
