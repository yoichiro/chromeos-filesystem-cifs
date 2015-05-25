(function(Types, Debug, Type2Message, ResponseUtils) {

    // Constructor

    var SessionSetupAndxResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.type2Message_ = null;
        this.nativeOS_ = null;
        this.nativeLanMan_ = null;
    };

    // Public functions

    SessionSetupAndxResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();
        var dataArray = this.responseUtils_.getSmbDataUint8Array(array);

        var wordCount = array[0];
        var securityBlobLength = this.types_.getFixed2BytesValue(array, 7);

        this.type2Message_ = new Type2Message();
        this.type2Message_.load(dataArray);

        var offsetOfAll = 32 + wordCount * 2 + 1 + securityBlobLength;
        var offset = securityBlobLength;
        if ((offsetOfAll - 4) % 2 != 0) {
            offset += 1;
        }

        var str = this.types_.getUnicodeNullEndString(dataArray, offset);
        this.nativeOS_ = str.result;
        str = this.types_.getUnicodeNullEndString(dataArray, str.nextPosition);
        this.nativeLanMan_ = str.result;
    };

    SessionSetupAndxResponse.prototype.getType2Message = function() {
        return this.type2Message_;
    };

    SessionSetupAndxResponse.prototype.getNativeOS = function() {
        return this.nativeOS_;
    };

    SessionSetupAndxResponse.prototype.getNativeLanMan = function() {
        return this.nativeLanMan_;
    };

    // Private functions

    // Export

    SmbClient.SessionSetupAndxResponse = SessionSetupAndxResponse;

})(SmbClient.Types, SmbClient.Debug, SmbClient.Type2Message, SmbClient.ResponseUtils);
