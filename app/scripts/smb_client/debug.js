(function(Constants) {

    "use strict";

    // Constructor

    var Debug = function() {
    };

    // 0: Trace, 1: Debug, 2: Info
    Debug.Level = 2;

    // Static functions

    Debug.trace = function(message) {
        if (Debug.Level > 0) {
            return;
        }
        console.log(message);
    };

    Debug.log = function(message) {
        if (Debug.Level > 1) {
            return;
        }
        console.log(message);
    };

    Debug.info = function(message) {
        if (Debug.Level > 2) {
            return;
        }
        console.log(message);
    };

    Debug.outputUint8Array = function(array) {
        var out = "";
        for (var i = 0; i < array.length; i++) {
            // out += String.fromCharCode(array[i]);
            out += (Number(array[i])).toString(16).toUpperCase() + " ";
        }
        console.log(out);
    };

    Debug.outputArrayBuffer = function(buffer) {
        var array = new Uint8Array(buffer);
        Debug.outputUint8Array(array);
    };

    Debug.getNtStatusMessage = function(code) {
        switch (code) {
        case Constants.NT_STATUS_OK:
            return "NT_STATUS_OK";
        case Constants.NT_STATUS_OK:
            return "NT_STATUS_OK";
        case Constants.NT_STATUS_UNSUCCESSFUL:
            return "NT_STATUS_UNSUCCESSFUL";
        case Constants.NT_STATUS_NOT_IMPLEMENTED:
            return "NT_STATUS_NOT_IMPLEMENTED";
        case Constants.NT_STATUS_INVALID_INFO_CLASS:
            return "NT_STATUS_INVALID_INFO_CLASS";
        case Constants.NT_STATUS_ACCESS_VIOLATION:
            return "NT_STATUS_ACCESS_VIOLATION";
        case Constants.NT_STATUS_INVALID_HANDLE:
            return "NT_STATUS_INVALID_HANDLE";
        case Constants.NT_STATUS_INVALID_PARAMETER:
            return "NT_STATUS_INVALID_PARAMETER";
        case Constants.NT_STATUS_NO_SUCH_DEVICE:
            return "NT_STATUS_NO_SUCH_DEVICE";
        case Constants.NT_STATUS_NO_SUCH_FILE:
            return "NT_STATUS_NO_SUCH_FILE";
        case Constants.NT_STATUS_MORE_PROCESSING_REQUIRED:
            return "NT_STATUS_MORE_PROCESSING_REQUIRED";
        case Constants.NT_STATUS_ACCESS_DENIED:
            return "NT_STATUS_ACCESS_DENIED";
        case Constants.NT_STATUS_BUFFER_TOO_SMALL:
            return "NT_STATUS_BUFFER_TOO_SMALL";
        case Constants.NT_STATUS_OBJECT_NAME_INVALID:
            return "NT_STATUS_OBJECT_NAME_INVALID";
        case Constants.NT_STATUS_OBJECT_NAME_NOT_FOUND:
            return "NT_STATUS_OBJECT_NAME_NOT_FOUND";
        case Constants.NT_STATUS_OBJECT_NAME_COLLISION:
            return "NT_STATUS_OBJECT_NAME_COLLISION";
        case Constants.NT_STATUS_PORT_DISCONNECTED:
            return "NT_STATUS_PORT_DISCONNECTED";
        case Constants.NT_STATUS_OBJECT_PATH_INVALID:
            return "NT_STATUS_OBJECT_PATH_INVALID";
        case Constants.NT_STATUS_OBJECT_PATH_NOT_FOUND:
            return "NT_STATUS_OBJECT_PATH_NOT_FOUND";
        case Constants.NT_STATUS_OBJECT_PATH_SYNTAX_BAD:
            return "NT_STATUS_OBJECT_PATH_SYNTAX_BAD";
        case Constants.NT_STATUS_SHARING_VIOLATION:
            return "NT_STATUS_SHARING_VIOLATION";
        case Constants.NT_STATUS_DELETE_PENDING:
            return "NT_STATUS_DELETE_PENDING";
        case Constants.NT_STATUS_NO_LOGON_SERVERS:
            return "NT_STATUS_NO_LOGON_SERVERS";
        case Constants.NT_STATUS_USER_EXISTS:
            return "NT_STATUS_USER_EXISTS";
        case Constants.NT_STATUS_NO_SUCH_USER:
            return "NT_STATUS_NO_SUCH_USER";
        case Constants.NT_STATUS_WRONG_PASSWORD:
            return "NT_STATUS_WRONG_PASSWORD";
        case Constants.NT_STATUS_LOGON_FAILURE:
            return "NT_STATUS_LOGON_FAILURE";
        case Constants.NT_STATUS_ACCOUNT_RESTRICTION:
            return "NT_STATUS_ACCOUNT_RESTRICTION";
        case Constants.NT_STATUS_INVALID_LOGON_HOURS:
            return "NT_STATUS_INVALID_LOGON_HOURS";
        case Constants.NT_STATUS_INVALID_WORKSTATION:
            return "NT_STATUS_INVALID_WORKSTATION";
        case Constants.NT_STATUS_PASSWORD_EXPIRED:
            return "NT_STATUS_PASSWORD_EXPIRED";
        case Constants.NT_STATUS_ACCOUNT_DISABLED:
            return "NT_STATUS_ACCOUNT_DISABLED";
        case Constants.NT_STATUS_NONE_MAPPED:
            return "NT_STATUS_NONE_MAPPED";
        case Constants.NT_STATUS_INVALID_SID:
            return "NT_STATUS_INVALID_SID";
        case Constants.NT_STATUS_INSTANCE_NOT_AVAILABLE:
            return "NT_STATUS_INSTANCE_NOT_AVAILABLE";
        case Constants.NT_STATUS_PIPE_NOT_AVAILABLE:
            return "NT_STATUS_PIPE_NOT_AVAILABLE";
        case Constants.NT_STATUS_INVALID_PIPE_STATE:
            return "NT_STATUS_INVALID_PIPE_STATE";
        case Constants.NT_STATUS_PIPE_BUSY:
            return "NT_STATUS_PIPE_BUSY";
        case Constants.NT_STATUS_PIPE_DISCONNECTED:
            return "NT_STATUS_PIPE_DISCONNECTED";
        case Constants.NT_STATUS_PIPE_CLOSING:
            return "NT_STATUS_PIPE_CLOSING";
        case Constants.NT_STATUS_PIPE_LISTENING:
            return "NT_STATUS_PIPE_LISTENING";
        case Constants.NT_STATUS_FILE_IS_A_DIRECTORY:
            return "NT_STATUS_FILE_IS_A_DIRECTORY";
        case Constants.NT_STATUS_DUPLICATE_NAME:
            return "NT_STATUS_DUPLICATE_NAME";
        case Constants.NT_STATUS_NETWORK_NAME_DELETED:
            return "NT_STATUS_NETWORK_NAME_DELETED";
        case Constants.NT_STATUS_NETWORK_ACCESS_DENIED:
            return "NT_STATUS_NETWORK_ACCESS_DENIED";
        case Constants.NT_STATUS_BAD_NETWORK_NAME:
            return "NT_STATUS_BAD_NETWORK_NAME";
        case Constants.NT_STATUS_REQUEST_NOT_ACCEPTED:
            return "NT_STATUS_REQUEST_NOT_ACCEPTED";
        case Constants.NT_STATUS_CANT_ACCESS_DOMAIN_INFO:
            return "NT_STATUS_CANT_ACCESS_DOMAIN_INFO";
        case Constants.NT_STATUS_NO_SUCH_DOMAIN:
            return "NT_STATUS_NO_SUCH_DOMAIN";
        case Constants.NT_STATUS_NOT_A_DIRECTORY:
            return "NT_STATUS_NOT_A_DIRECTORY";
        case Constants.NT_STATUS_CANNOT_DELETE:
            return "NT_STATUS_CANNOT_DELETE";
        case Constants.NT_STATUS_INVALID_COMPUTER_NAME:
            return "NT_STATUS_INVALID_COMPUTER_NAME";
        case Constants.NT_STATUS_PIPE_BROKEN:
            return "NT_STATUS_PIPE_BROKEN";
        case Constants.NT_STATUS_NO_SUCH_ALIAS:
            return "NT_STATUS_NO_SUCH_ALIAS";
        case Constants.NT_STATUS_LOGON_TYPE_NOT_GRANTED:
            return "NT_STATUS_LOGON_TYPE_NOT_GRANTED";
        case Constants.NT_STATUS_NO_TRUST_SAM_ACCOUNT:
            return "NT_STATUS_NO_TRUST_SAM_ACCOUNT";
        case Constants.NT_STATUS_TRUSTED_DOMAIN_FAILURE:
            return "NT_STATUS_TRUSTED_DOMAIN_FAILURE";
        case Constants.NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT:
            return "NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT";
        case Constants.NT_STATUS_PASSWORD_MUST_CHANGE:
            return "NT_STATUS_PASSWORD_MUST_CHANGE";
        case Constants.NT_STATUS_NOT_FOUND:
            return "NT_STATUS_NOT_FOUND";
        case Constants.NT_STATUS_ACCOUNT_LOCKED_OUT:
            return "NT_STATUS_ACCOUNT_LOCKED_OUT";
        case Constants.NT_STATUS_PATH_NOT_COVERED:
            return "NT_STATUS_PATH_NOT_COVERED";
        case Constants.NT_STATUS_IO_REPARSE_TAG_NOT_HANDLED:
            return "NT_STATUS_IO_REPARSE_TAG_NOT_HANDLED";
        default:
            return "UNKNOWN";
        }
    };

    // Export

    SmbClient.Debug = Debug;

})(SmbClient.Constants);
