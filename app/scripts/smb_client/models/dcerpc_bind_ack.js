(function(Types, DceRpc) {
    "use strict";

    // Constructor

    var DceRpcBindAck = function() {
        this.types_ = new Types();

        this.dceRpc_ = null;
        this.ackResult_ = null;
    };

    // Public functions

    DceRpcBindAck.prototype.load = function(array) {
        this.dceRpc_ = new DceRpc();
        this.dceRpc_.load(array);

        this.ackResult_ = this.types_.getFixed2BytesValue(array, 44);
    };

    DceRpcBindAck.prototype.getDceRpc = function() {
        return this.dceRpc_;
    };

    DceRpcBindAck.prototype.getAckResult = function() {
        return this.ackResult_;
    };

    // Export

    SmbClient.DceRpcBindAck = DceRpcBindAck;

})(SmbClient.Types, SmbClient.DceRpc);
