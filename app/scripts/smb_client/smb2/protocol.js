(function(Smb2,
          Constants,
          Packet,
          Header,
          Types) {

    "use strict";

    // Constructor

    var Protocol = function() {
        this.types_ = new Types();

        this.sequenceNumber_ = 2;
    };

    // Public functions

    // Export

    Smb2.Protocol = Protocol;

})(SmbClient.Smb2,
   SmbClient.Constants,
   SmbClient.Packet,
   SmbClient.Smb2.Models.Header,
   SmbClient.Types);