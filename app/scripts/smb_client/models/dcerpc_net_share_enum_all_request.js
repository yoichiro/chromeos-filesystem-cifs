(function(Types, DceRpc, Constants, Debug) {
    "use strict";

    // Constructor

    var DceRpcNetShareEnumAllRequest = function() {
        this.types_ = new Types();

        this.fid_ = null;
        this.serverName_ = null;
    };

    // Public functions

    // fid: Number
    DceRpcNetShareEnumAllRequest.prototype.setFId = function(fid) {
        this.fid_ = fid;
    };

    DceRpcNetShareEnumAllRequest.prototype.setServerName = function(serverName) {
        this.serverName_ = serverName;
    };

    DceRpcNetShareEnumAllRequest.prototype.createTransactionParameter = function() {
        return null;
    };

    DceRpcNetShareEnumAllRequest.prototype.createTransactionData = function() {
        var rpc = new DceRpc();

        rpc.setPacketType(Constants.DCERPC_PACKET_TYPE_REQUEST);
        rpc.setCallId(2);
        rpc.setOpnum(0x0f); // NetShareEnumAll

        var serverUnc = "\\\\" + this.serverName_;
        var serverUncLength = serverUnc.length + 1; // Null terminated

        var total = 44 + serverUncLength * 2;
        total += this.types_.getPaddingLength(16 + serverUncLength * 2, 4);

        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Point to Server Unc (uint16)
        // -- Referent ID
        setReferentId.call(this, array, 0);
        // -- Max Count
        this.types_.setFixed4BytesValue(serverUncLength, array, 4);
        // -- Offset
        this.types_.setFixed4BytesValue(0, array, 8);
        // -- Actual Count
        this.types_.setFixed4BytesValue(serverUncLength, array, 12);
        // -- Server Unc
        var next = this.types_.setUnicodeNullEndString(serverUnc, array, 16);

        // Padding
        next += this.types_.getPaddingLength(next, 4);

        // Point to Level (uint32)
        // -- Level
        this.types_.setFixed4BytesValue(1, array, next);

        // Point to Ctr (srvsvc_NetShareCtr)
        // -- Ctr
        this.types_.setFixed4BytesValue(1, array, next + 4);
        // -- Referent ID
        setReferentId.call(this, array, next + 8);
        // -- Count
        this.types_.setFixed4BytesValue(0, array, next + 12);
        // -- Pointer to Array
        this.types_.setFixed4BytesValue(0, array, next + 16);

        // Max Buffer
        this.types_.setFixed4BytesValue(0xffffffff, array, next + 20);
        // Pointer to Resume Handle (uint32)
        this.types_.setFixed4BytesValue(0, array, next + 24);

        rpc.setBodyBuffer(buffer);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(rpc.createArrayBuffer());
    };

    DceRpcNetShareEnumAllRequest.prototype.createTransactionSetup = function() {
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

    // Private functions

    // array: Uint8Array
    var setReferentId = function(array, offset) {
        var rand = Math.floor((Math.random() * 1000000) + 1);
        this.types_.setFixed4BytesValue(rand, array, offset);
    };

    // Export

    SmbClient.DceRpcNetShareEnumAllRequest = DceRpcNetShareEnumAllRequest;

})(SmbClient.Types, SmbClient.DceRpc, SmbClient.Constants, SmbClient.Debug);
