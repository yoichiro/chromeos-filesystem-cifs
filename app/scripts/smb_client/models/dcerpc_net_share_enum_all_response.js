(function(Types, DceRpc, Debug) {

    // Constructor

    var DceRpcNetShareEnumAllResponse = function() {
        this.types_ = new Types();

        this.dceRpc_ = null;

        this.count_ = null;
        this.netShareEnums_ = null;
    };

    // Public functions

    DceRpcNetShareEnumAllResponse.prototype.load = function(array, dataOffset) {
        this.dceRpc_ = new DceRpc();
        this.dceRpc_.load(array);

        // Pointer to Array - Count
        this.count_ = this.types_.getFixed4BytesValue(array, 36);

        this.netShareEnums_ = [];

        // Pointer to Array - Type
        var next = 48;
        var i;
        for (i = 0; i < this.count_; i++) {
            var nameReferentId = this.types_.getFixed4BytesValue(array, next);
            var type = this.types_.getFixed4BytesValue(array, next + 4);
            var commentReferentId = this.types_.getFixed4BytesValue(array, next + 8);
            this.netShareEnums_.push({
                nameReferentId: nameReferentId,
                type: type,
                commentReferentId: commentReferentId
            });
            next += 12;
        }
        // Pointer to Array - Name & Comment
        for (i = 0; i < this.count_; i++) {
            // Name
            var stringInfo = readString.call(this, array, next);
            var name = stringInfo.text;
            next = stringInfo.uniString.nextPosition;
            next += this.types_.getPaddingLength(next + dataOffset, 4);
            // Comment
            stringInfo = readString.call(this, array, next);
            var comment = stringInfo.text;
            next = stringInfo.uniString.nextPosition;
            next += this.types_.getPaddingLength(next + dataOffset, 4);

            this.netShareEnums_[i].name = name;
            this.netShareEnums_[i].comment = comment;
        }
    };

    DceRpcNetShareEnumAllResponse.prototype.getDceRpc = function() {
        return this.dceRpc_;
    };

    DceRpcNetShareEnumAllResponse.prototype.getNetShareEnums = function() {
        return this.netShareEnums_;
    };

    // Private functions

    var readString = function(array, next) {
        var maxCount = this.types_.getFixed4BytesValue(array, next);
        next += 4;
        var offset = this.types_.getFixed4BytesValue(array, next);
        next += 4;
        var actualCount = this.types_.getFixed4BytesValue(array, next);
        next += 4;
        var uniString = this.types_.getUnicodeNullEndString(array, next);
        var text = uniString.result;
        return {
            maxCount: maxCount,
            offset: offset,
            actualCount: actualCount,
            text: text,
            uniString: uniString
        };
    };

    // Export

    SmbClient.DceRpcNetShareEnumAllResponse = DceRpcNetShareEnumAllResponse;

})(SmbClient.Types, SmbClient.DceRpc, SmbClient.Debug);
