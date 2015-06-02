(function(Types, ResponseUtils) {
    "use strict";

    // Constructor

    var TreeConnectAndxResponse = function() {
        this.types_ = new Types();
        this.responseUtils_ = new ResponseUtils();

        this.supportSearchBits_ = null;
        this.shareIsInDfs_ = null;

        this.service_ = null;
    };

    // Constants

    TreeConnectAndxResponse.SMB_SUPPORT_SEARCH_BITS = 0x0001;
    TreeConnectAndxResponse.SMB_SHARE_IS_IN_DFS = 0x0002;

    // Public functions

    /*jslint bitwise: true */
    TreeConnectAndxResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        var offset = this.responseUtils_.getOffsetSkippedAndxData();
        this.supportSearchBits_ =
            (array[offset] & TreeConnectAndxResponse.SMB_SUPPORT_SEARCH_BITS) !== 0;
        this.shareIsInDfs_ =
            (array[offset] & TreeConnectAndxResponse.SMB_SHARE_IS_IN_DFS) !== 0;

        var dataArray = this.responseUtils_.getSmbDataUint8Array(array);

        this.service_ = this.types_.getNullEndString(dataArray, 0).result;
    };

    // Export

    SmbClient.TreeConnectAndxResponse = TreeConnectAndxResponse;

})(SmbClient.Types, SmbClient.ResponseUtils);
