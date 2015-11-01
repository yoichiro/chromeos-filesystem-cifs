(function(Auth) {
    "use strict";

    // Constructor

    var CRC32 = function() {
    };

    // Public functions

    // buffer: ArrayBuffer
    CRC32.prototype.calculate = function(buffer) {
        var crcTable = CRC32.crcTable || (CRC32.crcTable = createCRCTable.call(this));

        var crc = 0 ^ (-1);

        var array = new Uint8Array(buffer);
        for (var i = 0; i < array.length; i++ ) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ array[i]) & 0xff];
        }

        return (crc ^ (-1)) >>> 0;
    };

    // Private functions

    var createCRCTable = function() {
        var c;
        var crcTable = [];
        for(var n =0; n < 256; n++){
            c = n;
            for(var k =0; k < 8; k++){
                c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    };

    // Export

    Auth.CRC32 = CRC32;

})(SmbClient.Auth);
