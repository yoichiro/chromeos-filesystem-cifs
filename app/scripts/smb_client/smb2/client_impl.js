(function(Smb2, Constants, Debug, Protocol, Packet) {
    "use strict";
    
    // Constructor
    
    var ClientImpl = function(client) {
        this.protocol_ = new Protocol();
      
        this.client_ = client;
        this.comm_ = client.getCommunication();
    };
    
    // Public functions
    
    ClientImpl.prototype.handleNegotiateResponse = function(packet, onSuccess, onError) {
        var session = this.client_.getSession();
        var header = packet.getHeader();
        if (checkError.call(this, header, onError)) {
            var negotiateResponse =
                    this.protocol_.parseNegotiateResponse(packet);
            if (negotiateResponse.getDialectRevision() !== Constants.DIALECT_SMB_2_002_REVISION) {
                onError("Supported dialect not found");
            } else {
                session.setMaxBufferSize(
                    negotiateResponse.getMaxReadSize());
                onSuccess(header, negotiateResponse);
            }
        }
    };
    
    ClientImpl.prototype.sessionSetup = function(negotiateResponse, userName, password, domainName, onSuccess, onError) {
        sendType1Message.call(this, negotiateResponse, function(
            header, sessionSetupResponse) {

            var type2Message = sessionSetupResponse.getType2Message();
            Debug.outputType2MessageFlags(type2Message);

            sendType3Message.call(this, userName, password, domainName, negotiateResponse, sessionSetupResponse, function() {
                onSuccess();
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    // Private functions
    
    var checkError = function(header, onError, expected) {
        var errorCode = header.getStatus();
        if (expected) {
            if (errorCode === expected) {
                return true;
            } else {
                onError(Number(errorCode).toString(16) + ": " + Debug.getNtStatusMessage(errorCode));
                return false;
            }
        } else {
            if (errorCode === Constants.NT_STATUS_OK) {
                return true;
            } else if (errorCode === Constants.STATUS_BUFFER_OVERFLOW) {
                // Normal for DCERPC named pipes
                Debug.info("0x80000005: STATUS_BUFFER_OVERFLOW: Normal for DCERPC named pipes. Ignore.");
                return true;
            } else {
                onError(Number(errorCode).toString(16) + ": " + Debug.getNtStatusMessage(errorCode));
                return false;
            }
        }
    };
    
    var sendType1Message = function(negotiateResponse, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupRequestPacket =
                this.protocol_.createSessionSetupRequestType1Packet(
                    session, negotiateResponse);
        Debug.log(sessionSetupRequestPacket);
        this.comm_.writePacket(sessionSetupRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError,
                                    Constants.NT_STATUS_MORE_PROCESSING_REQUIRED)) {
                    var sessionSetupResponse =
                            this.protocol_.parseSessionSetupResponse(packet);
                    session.setUserId(header.getSessionId());
                    onSuccess(header, sessionSetupResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var sendType3Message = function(userName, password, domainName, negotiateResponse, sessionSetupResponse, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupRequestPacket =
                this.protocol_.createSessionSetupRequestType3Packet(
                    session, userName, password, domainName, negotiateResponse,
                    sessionSetupResponse.getType2Message());
        Debug.log(sessionSetupRequestPacket);
        this.comm_.writePacket(sessionSetupRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    onSuccess();
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    // Export
    
    Smb2.ClientImpl = ClientImpl;
    
    
})(SmbClient.Smb2,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb2.Protocol,
   SmbClient.Packet);
