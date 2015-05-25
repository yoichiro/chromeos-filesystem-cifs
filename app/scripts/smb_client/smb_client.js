(function() {
    "use strict";

    var SmbClient = {};

    if ("undefined" == typeof module) {
        window.SmbClient = SmbClient;
    } else {
        module.exports = SmbClient;
    }
})();
