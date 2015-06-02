(function(Types) {
    "use strict";

    // Constructor

    var RequestUtils = function() {
        this.types_ = new Types();
    };

    // Public functions

    RequestUtils.prototype.createTransactionSetupSubCommandOnly = function(subCommand) {
        var buffer = new ArrayBuffer(2);
        var array = new Uint8Array(buffer);

        this.types_.setFixed2BytesValue(subCommand, array, 0);

        return (function(createdBuffer) {
            return {
                createArrayBuffer: function() {
                    return createdBuffer;
                }
            };
        })(buffer);
    };

    /*jslint bitwise: true */
    RequestUtils.prototype.divide8BytesValue = function(value) {
        var low = value & 0xffffffff;
        var high = value >>> 31;
        return {
            low: low,
            high: high
        };
    };

    // Export

    SmbClient.RequestUtils = RequestUtils;

})(SmbClient.Types);
