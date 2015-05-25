(function(Types, ResponseUtils, Debug) {

    // Constructor

    var TransactionResponse = function() {
        this.types_ = new Types();
        this.ResponseUtils_ = new ResponseUtils();

        this.parameter_ = null;
        this.data_ = null;
        this.setup_ = null;

        this.parameterOffset_ = null;
        this.dataOffset_ = null;
    };

    // Public functions

    TransactionResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        var parameterCount = this.types_.getFixed2BytesValue(array, 7);
        var parameterOffset = this.types_.getFixed2BytesValue(array, 9) - 32;
        var dataCount = this.types_.getFixed2BytesValue(array, 13);
        var dataOffset = this.types_.getFixed2BytesValue(array, 15) - 32;
        var setupCount = array[19];

        if (parameterCount > 0) {
            this.parameter_ = array.subarray(
                parameterOffset, parameterOffset + parameterCount);
            this.parameterOffset_ = parameterOffset;
        }
        if (dataCount > 0) {
            this.data_ = array.subarray(dataOffset, dataOffset + dataCount);
            this.dataOffset_ = dataOffset;
        }
        if (setupCount > 0) {
            this.setup_ = array.subarray(20, 20 + setupCount * 2);
        }
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getParameter = function() {
        return this.parameter_;
    };

    TransactionResponse.prototype.getParameterOffset = function() {
        return this.parameterOffset_;
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getData = function() {
        return this.data_;
    };

    TransactionResponse.prototype.getDataOffset = function() {
        return this.dataOffset_;
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getSetup = function() {
        return this.setup_;
    };

    // Export

    SmbClient.TransactionResponse = TransactionResponse;

})(SmbClient.Types, SmbClient.ResponseUtils, SmbClient.Debug);
