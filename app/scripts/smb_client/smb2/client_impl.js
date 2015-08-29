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

    /*jslint bitwise: true */
    ClientImpl.prototype.getSharedResourceList = function(onSuccess, onError) {
        var errorHandler = function(error) {
            console.log(error);
            onError(error);
        }.bind(this);

        connectTree.call(this, "IPC$", function(
            treeConnectResponseHeader, treeConnectResponse) {
            Debug.log(treeConnectResponseHeader);
            Debug.log(treeConnectResponse);
            var options = {
                desiredAccess:
                    Constants.GENERIC_WRITE | Constants.GENERIC_READ,
                fileAttributes:
                    Constants.SMB2_FILE_ATTRIBUTE_NORMAL,
                shareAccess:
                    Constants.FILE_SHARE_READ |
                    Constants.FILE_SHARE_WRITE,
                createDisposition: Constants.FILE_OPEN,
                name: "\\srvsvc",
                createContexts: [
                    this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
                ]
            };
            create.call(this, options, function(
                createResponseHeader, createResponse) {
                Debug.log(createResponseHeader);
                Debug.log(createResponse);
                var fid = createResponse.getFileId();
                dceRpcBind.call(this, fid, function(
                    dceRpcBindResponseHeader, dceRpcBindAck) {
                    Debug.log(dceRpcBindResponseHeader);
                    Debug.log(dceRpcBindAck);
                    netShareEnumAll.call(this, fid, function(
                        dceRpcNetShareEnumAllResponseHeader, dceRpcNetShareEnumAllResponse) {
                        Debug.log(dceRpcNetShareEnumAllResponseHeader);
                        Debug.log(dceRpcNetShareEnumAllResponse);
                        close.call(this, fid, function(closeResponseHeader) {
                            Debug.log(closeResponseHeader);
                            onSuccess(dceRpcNetShareEnumAllResponse.getNetShareEnums());
                        }.bind(this), errorHandler);
                    }.bind(this), errorHandler);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
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
    
    var connectTree = function(name, onSuccess, onError) {
        var session = this.client_.getSession();
        var treeConnectRequestPacket =
                this.protocol_.createTreeConnectRequestPacket(
                    session, name);
        Debug.log(treeConnectRequestPacket);
        this.comm_.writePacket(treeConnectRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    session.setTreeId(header.getTreeId());
                    var treeConnectResponse =
                            this.protocol_.parseTreeConnectResponse(packet);
                    onSuccess(header, treeConnectResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var create = function(options, onSuccess, onError) {
        var session = this.client_.getSession();
        var createRequestPacket = this.protocol_.createCreateRequestPacket(
            session, options);
        Debug.log(createRequestPacket);
        this.comm_.writePacket(createRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var createResponse =
                            this.protocol_.parseCreateResponse(packet);
                    onSuccess(header, createResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var dceRpcBind = function(fid, onSuccess, onError) {
        var session = this.client_.getSession();
        var dceRpcBindRequestPacket = this.protocol_.createDceRpcBindRequestPacket(session, fid);
        Debug.log(dceRpcBindRequestPacket);
        this.comm_.writePacket(dceRpcBindRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var dceRpcBindAck = this.protocol_.parseDceRpcBindAckPacket(packet);
                    onSuccess(header, dceRpcBindAck);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var netShareEnumAll = function(fid, onSuccess, onError) {
        var session = this.client_.getSession();
        var dceRpcNetShareEnumAllRequestPacket =
                this.protocol_.createDceRpcNetShareEnumAllRequestPacket(
                    session, fid);
        Debug.log(dceRpcNetShareEnumAllRequestPacket);
        this.comm_.writePacket(dceRpcNetShareEnumAllRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (header.getStatus() === Constants.STATUS_BUFFER_OVERFLOW) {
                    // TODO Support STATUS_BUFFER_OVERFLOW
                    /*
                    read.call(this, fid, 0, Constants.TRANSACTION_MAX_APPEND_READ_SIZE, function(buffer) {
                        var newBuffer = this.binaryUtils_.concatBuffers([packet.getData(), buffer]);
                        var dceRpcNetShareEnumAllResponse =
                                this.protocol_.parseDceRpcNetShareEnumAllResponsePacket(
                                    new Packet(newBuffer), buffer.byteLength);
                        onSuccess(header, dceRpcNetShareEnumAllResponse);
                    }.bind(this), function(error) {
                        onError(error);
                    }.bind(this));
                    */
                } else {
                    if (checkError.call(this, header, onError)) {
                        var dceRpcNetShareEnumAllResponse =
                                this.protocol_.parseDceRpcNetShareEnumAllResponsePacket(packet, 0);
                        onSuccess(header, dceRpcNetShareEnumAllResponse);
                    }
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var close = function(fid, onSuccess, onError) {
        var session = this.client_.getSession();
        var closeRequestPacket = this.protocol_.createCloseRequestPacket(
            session, fid);
        Debug.log(closeRequestPacket);
        this.comm_.writePacket(closeRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    onSuccess(header);
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
