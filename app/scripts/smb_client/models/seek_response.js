(function(Types) {

    // Constructor

    var SeekResponse = function() {
        this.types_ = new Types();

        this.offset_ = null;
    };

    // Public functions

    SeekResponse.prototype.load = function(packet) {
        var array = packet.getSmbParametersAndSmbDataUint8Array();

        // Offset
        this.offset_ = this.types_.getFixed4BytesValue(array, 1);
    };

    SeekResponse.prototype.getOffset = function() {
        return this.offset_;
    };

    // Export

    SmbClient.SeekResponse = SeekResponse;

})(SmbClient.Types);
