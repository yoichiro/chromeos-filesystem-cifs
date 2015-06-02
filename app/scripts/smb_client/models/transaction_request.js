(function(Types, Debug) {
    "use strict";

    // Constructor

    var TransactionRequest = function() {
        this.types_ = new Types();

        this.transactionName_ = null; // Null if SMBtrans2
        this.flags_ = 0;
        this.timeout_ = 0;

        this.parameter_ = null;
        this.data_ = null;
        this.setup_ = null;
    };

    // Public functions

    TransactionRequest.prototype.setSubMessage = function(message) {
        this.parameter_ = message.createTransactionParameter();
        this.data_ = message.createTransactionData();
        this.setup_ = message.createTransactionSetup();
    };

    TransactionRequest.prototype.setTransactionName = function(name) {
        this.transactionName_ = name;
    };

    TransactionRequest.prototype.createSmbParametersArrayBuffer = function() {
        var parameterBuffer = null;
        if (this.parameter_) {
            parameterBuffer = this.parameter_.createArrayBuffer();
        }
        var dataBuffer = null;
        if (this.data_) {
            dataBuffer = this.data_.createArrayBuffer();
        }
        var setupBuffer = null;
        if (this.setup_) {
            setupBuffer = this.setup_.createArrayBuffer();
        }

        var total = 14 * 2;
        if (this.setup_) {
            total += setupBuffer.byteLength;
        }
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Flags
        this.types_.setFixed2BytesValue(this.flags_, array, 10);
        // Timeout
        this.types_.setFixed4BytesValue(this.timeout_, array, 12);

        var transactionNameLength;
        if (this.transactionName_) {
            transactionNameLength = (this.transactionName_.length + 1) * 2;
        } else {
            transactionNameLength = 0;
        }

        var parameterOffset =
                32 + // SMB Header
                1 + // SMB WordCount
                14 * 2 + // SMB Parameter
                setupBuffer.byteLength + // Setup length
                2 + // SMB ByteCount
                transactionNameLength + // Transaction Name
                1; // Padding
        if (this.parameter_) {
            // TotalParamCount
            this.types_.setFixed2BytesValue(parameterBuffer.byteLength, array, 0);
            // ParameterCount
            this.types_.setFixed2BytesValue(parameterBuffer.byteLength, array, 18);
            // ParameterOffset
            this.types_.setFixed2BytesValue(parameterOffset, array, 20);
        } else {
            // TotalParamCount
            this.types_.setFixed2BytesValue(0, array, 0);
            // ParameterCount
            this.types_.setFixed2BytesValue(0, array, 18);
            // ParameterOffset
            //this.types_.setFixed2BytesValue(parameterOffset, array, 20);
            this.types_.setFixed2BytesValue(0, array, 20);
        }
        // MaxParameterCount
        this.types_.setFixed2BytesValue(1024, array, 4);

        var dataOffset =
                /*
                parameterOffset +
                1; // Padding
                 */
            parameterOffset;
        if (this.parameter_) {
            dataOffset += parameterBuffer.byteLength;
        }
        if (this.data_) {
            // TotalDataCount
            this.types_.setFixed2BytesValue(dataBuffer.byteLength, array, 2);
            // DataCount
            this.types_.setFixed2BytesValue(dataBuffer.byteLength, array, 22);
            // DataOffset
            this.types_.setFixed2BytesValue(dataOffset, array, 24);
        } else {
            // TotalDataCount
            this.types_.setFixed2BytesValue(0, array, 2);
            // DataCount
            this.types_.setFixed2BytesValue(0, array, 22);
            // DataOffset
            //this.types_.setFixed2BytesValue(dataOffset, array, 24);
            this.types_.setFixed2BytesValue(0, array, 24);
        }
        // MaxDataCount
        this.types_.setFixed2BytesValue(1024, array, 6);

        if (this.setup_) {
            // SetupCount
            this.types_.setFixed2BytesValue(setupBuffer.byteLength / 2, array, 26);
            // Setup
            this.types_.copyArray(new Uint8Array(setupBuffer), array,
                                  28, setupBuffer.byteLength);
        } else {
            // SetupCount
            this.types_.setFixed2BytesValue(0, array, 26);
        }

        return buffer;
    };

    TransactionRequest.prototype.createSmbDataArrayBuffer = function() {
        var total;
        if (this.transactionName_) {
            total =
                1 + (this.transactionName_.length + 1) * 2; // Transaction Name
        } else {
            total =
                1; // Null (0x00) as Transaction Name
        }

        var parameterBuffer = null;
        if (this.parameter_) {
            parameterBuffer = this.parameter_.createArrayBuffer();
            //total += 1; // Padding
            total += parameterBuffer.byteLength;
        }
        var dataBuffer = null;
        if (this.data_) {
            dataBuffer = this.data_.createArrayBuffer();
            //total += 1; // Padding
            total += dataBuffer.byteLength;
        }

        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);

        // Transaction Name
        var next;
        if (this.transactionName_) {
            next = this.types_.setUnicodeNullEndString(this.transactionName_, array, 1);
        } else {
            next = 1;
        }
        // Parameter
        if (this.parameter_) {
            this.types_.copyArray(new Uint8Array(parameterBuffer), array,
                                  next /*+ 1*/, parameterBuffer.byteLength);
            next += parameterBuffer.byteLength;
        }
        // Data
        if (this.data_) {
            this.types_.copyArray(new Uint8Array(dataBuffer), array,
                                  next /*+ 1*/, dataBuffer.byteLength);
        }

        return buffer;
    };

    // Private functions

    // Export

    SmbClient.TransactionRequest = TransactionRequest;

})(SmbClient.Types, SmbClient.Debug);
