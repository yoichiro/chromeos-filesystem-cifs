(function(Types, ResponseUtils, Debug) {
    "use strict";

    // Constructor

    var TransactionResponse = function() {
        this.types_ = new Types();
        this.ResponseUtils_ = new ResponseUtils();

        this.parameter_ = null;
        this.data_ = null;
        this.setup_ = null;

        this.totalParameterCount_ = null;
        this.parameterCount_ = null;
        this.parameterOffset_ = null;
        this.parameterDisplacement_ = null;

        this.totalDataCount_ = null;
        this.dataCount_ = null;
        this.dataOffset_ = null;
        this.dataDisplacement_ = null;
    };

    // Public functions

    TransactionResponse.prototype.load = function(packet, appendedDataCount) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        this.totalParameterCount_ = this.types_.getFixed2BytesValue(array, 1);
        var parameterCount = this.types_.getFixed2BytesValue(array, 7);
        this.parameterCount_= parameterCount;
        var parameterOffset = this.types_.getFixed2BytesValue(array, 9) - 32;
        this.parameterDisplacement_ = this.types_.getFixed2BytesValue(array, 11);
        
        this.totalDataCount_ = this.types_.getFixed2BytesValue(array, 3);
        var dataCount = this.types_.getFixed2BytesValue(array, 13) + appendedDataCount;
        this.dataCount_ = dataCount;
        var dataOffset = this.types_.getFixed2BytesValue(array, 15) - 32;
        this.dataDisplacement_ = this.types_.getFixed2BytesValue(array, 17);
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
    
    TransactionResponse.prototype.getTotalParameterCount = function() {
        return this.totalParameterCount_;
    };

    TransactionResponse.prototype.getTotalDataCount = function() {
        return this.totalDataCount_;
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getParameter = function() {
        return this.parameter_;
    };
    
    TransactionResponse.prototype.getParameterCount = function() {
        return this.parameterCount_;
    };

    TransactionResponse.prototype.getParameterOffset = function() {
        return this.parameterOffset_;
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getData = function() {
        return this.data_;
    };

    TransactionResponse.prototype.getDataCount = function() {
        return this.dataCount_;
    };

    TransactionResponse.prototype.getDataOffset = function() {
        return this.dataOffset_;
    };

    // This returns the result as Uint8Array.
    TransactionResponse.prototype.getSetup = function() {
        return this.setup_;
    };
    
    TransactionResponse.prototype.getParameterDisplacement = function() {
        return this.parameterDisplacement_;
    };

    TransactionResponse.prototype.getDataDisplacement = function() {
        return this.dataDisplacement_;
    };

    // Export

    SmbClient.TransactionResponse = TransactionResponse;

})(SmbClient.Types, SmbClient.ResponseUtils, SmbClient.Debug);
