(function(Smb1, Constants, Debug, Protocol, Packet, BinaryUtils) {
    "use strict";
    
    // Constructor
    
    var ClientImpl = function(client) {
        this.protocol_ = new Protocol();
        this.binaryUtils_ = new BinaryUtils();
      
        this.client_ = client;
        this.comm_ = client.getCommunication();
    };
    
    // Public functions
    
    ClientImpl.prototype.negotiateProtocol = function(onSuccess, onError) {
        var session = this.client_.getSession();
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var maxProtocolVersion = settings.maxProtocolVersion;
            if (typeof maxProtocolVersion === "undefined") {
                maxProtocolVersion = 2;
            }
            var dialects = null;
            if (maxProtocolVersion === 1) {
                dialects = [Constants.DIALECT_NT_LM_0_12];
            } else {
                dialects = [Constants.DIALECT_NT_LM_0_12, Constants.DIALECT_SMB_2_002];
            }
            var negotiateProtocolRequestPacket =
                    this.protocol_.createNegotiateProtocolRequestPacket(
                        session,
                        dialects);
            Debug.log(negotiateProtocolRequestPacket);
            this.comm_.writePacket(negotiateProtocolRequestPacket, function() {
                this.comm_.readPacket(function(packet) {
                    onSuccess(packet);
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this));
    };
    
    ClientImpl.prototype.handleNegotiateProtocolResponse = function(packet, onSuccess, onError) {
        var session = this.client_.getSession();
        var header = packet.getHeader();
        if (checkError.call(this, header, onError)) {
            var negotiateProtocolResponse =
                    this.protocol_.parseNegotiateProtocolResponse(packet);
            if (negotiateProtocolResponse.getDialectIndex() === Constants.NO_SUPPORTED_DIALECT) {
                onError("Supported dialect not found");
            } else {
                Debug.outputCapabilityFlags(negotiateProtocolResponse);
                Debug.outputSecurityMode(negotiateProtocolResponse);
                session.setMaxBufferSize(
                    negotiateProtocolResponse.getMaxBufferSize());
                onSuccess(header, negotiateProtocolResponse);
            }
        }
    };
    
    ClientImpl.prototype.sessionSetup = function(negotiateProtocolResponse, userName, password, domainName, onSuccess, onError) {
        if (negotiateProtocolResponse.isSecurityModeOf(Constants.NEGOTIATE_SECURITY_USER_LEVEL) === 1) { // user
            if (negotiateProtocolResponse.isCapabilityOf(Constants.CAP_EXTENDED_SECURITY)) {
                sendType1Message.call(this, negotiateProtocolResponse, function(
                    header, sessionSetupResponse) {

                    var type2Message = sessionSetupResponse.getType2Message();
                    Debug.outputType2MessageFlags(type2Message);

                    sendType3Message.call(this, userName, password, domainName, negotiateProtocolResponse, sessionSetupResponse, function() {
                        onSuccess();
                    }.bind(this), function(error) {
                        onError(error);
                    }.bind(this));
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            } else if (negotiateProtocolResponse.isSecurityModeOf(Constants.NEGOTIATE_SECURITY_CHALLENGE_RESPONSE) === 1) {
                sendSessionSetupRequestForUnextendedSecurity.call(this, negotiateProtocolResponse, userName, password, domainName, function(header) {
                    onSuccess();
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            } else {
                onError("Sending plain password not supported");
            }
        } else { // share
            sendSessionSetupRequestForShare.call(this, negotiateProtocolResponse, userName, function(header) {
                onSuccess();
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }
    };
    
    /*jslint bitwise: true */
    ClientImpl.prototype.getSharedResourceList = function(onSuccess, onError) {
        var errorHandler = function(error) {
            console.log(error);
            onError(error);
        }.bind(this);

        connectTree.call(this, "IPC$", "?????", function(
            treeConnectAndxResponseHeader, treeConnectAndxResponse) {
            Debug.log(treeConnectAndxResponseHeader);
            Debug.log(treeConnectAndxResponse);
            var options = {
                flags: 0x16,
                desiredAccess:
                    Constants.FILE_READ_DATA |
                    Constants.FILE_WRITE_DATA |
                    Constants.FILE_APPEND_DATA |
                    Constants.FILE_READ_EA |
                    Constants.FILE_WRITE_EA |
                    Constants.FILE_READ_ATTRIBUTES |
                    Constants.FILE_WRITE_ATTRIBUTES |
                    Constants.READ_CONTROL,
                extFileAttributes: Constants.SMB_EXT_FILE_ATTR_ATTR_NORMAL,
                shareAccess:
                    Constants.FILE_SHARE_READ |
                    Constants.FILE_SHARE_WRITE |
                    Constants.FILE_SHARE_DELETE,
                createDisposition: Constants.FILE_OPEN,
                createOptions: Constants.FILE_NON_DIRECTORY_FILE,
                fileName: "\\srvsvc"
            };
            ntCreate.call(this, options, function(
                ntCreateAndxResponseHeader, ntCreateAndxResponse) {
                Debug.log(ntCreateAndxResponseHeader);
                Debug.log(ntCreateAndxResponse);
                var fid = ntCreateAndxResponse.getFId();
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
    
    ClientImpl.prototype.logout = function(onSuccess, onError) {
        var session = this.client_.getSession();
        
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        var logoffAndDisconnect = function() {
            logoffAndx.call(this, function() {
                onSuccess();
            }.bind(this), errorHandler);
        }.bind(this);

        if (session.getTreeId()) {
            disconnectTree.call(this, logoffAndDisconnect, errorHandler);
        } else {
            logoffAndDisconnect();
        }
    };
    
    ClientImpl.prototype.connectSharedResource = function(path, onSuccess, onError) {
        connectTree.call(this, path.toUpperCase(), "?????", function(
            treeConnectAndxResponseHeader, treeConnectAndxResponse) {
            Debug.log(treeConnectAndxResponseHeader);
            Debug.log(treeConnectAndxResponse);
            onSuccess();
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    ClientImpl.prototype.getMetadata = function(fileName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        queryPathInfo.call(this, fileName, function(
            queryPathInfoResponseHeader, queryPathInfoResponse) {
            Debug.log(queryPathInfoResponseHeader);
            Debug.log(queryPathInfoResponse);
            onSuccess(queryPathInfoResponse.getFile());
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.readDirectory = function(directoryName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        findFirst2.call(this, directoryName, function(
            findFirst2ResponseHeader, findFirst2Response) {
            Debug.log(findFirst2ResponseHeader);
            Debug.log(findFirst2Response);
            var searchId = findFirst2Response.getSearchId();
            var hasNext = findFirst2Response.hasNext();
            var files = findFirst2Response.getFiles();
            findNext2.call(this, searchId, files, hasNext, function() {
                findClose2.call(this, searchId, function() {
                    var result = [];
                    for (var i = 0; i < files.length; i++) {
                        if ((files[i].getFileName() !== ".") && (files[i].getFileName() !== "..")) {
                            files[i].setFullFileName(directoryName + "\\" + files[i].getFileName());
                            result.push(files[i]);
                        }
                    }
                    onSuccess(result);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.readFile = function(fileName, offset, length, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, fileName, "READ", {}, function(fid) {
            read.call(this, fid, offset, length, function(buffer) {
                close.call(this, fid, function() {
                    onSuccess(buffer);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.createFile = function(fileName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, fileName, "WRITE", {truncate: false}, function(fid) {
            close.call(this, fid, function() {
                onSuccess();
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.truncate = function(fileName, length, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, fileName, "READ", {}, function(fid) {
            read.call(this, fid, 0, length, function(buffer) {
                close.call(this, fid, function() {
                    var array = new Uint8Array(buffer);
                    var readLength = array.length;
                    var newArray;
                    if (readLength < length) {
                        var newBuffer = new ArrayBuffer(length);
                        newArray = new Uint8Array(newBuffer);
                        newArray.set(array, 0);
                    } else if (length === readLength) {
                        newArray = array;
                    } else { // Never
                        throw new Error("length < readLength");
                    }
                    openFile.call(this, fileName, "WRITE", {
                        truncate: true
                    }, function(fid) {
                        write.call(this, fid, 0, newArray, function() {
                            close.call(this, fid, function() {
                                onSuccess();
                            }.bind(this), errorHandler);
                        }.bind(this), errorHandler);
                    }.bind(this), errorHandler);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.writeFile = function(fileName, offset, array, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, fileName, "WRITE", {}, function(fid) {
            write.call(this, fid, offset, array, function() {
                close.call(this, fid, function() {
                    onSuccess();
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.createDirectory = function(directoryName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        createDirectory_.call(this, directoryName, function(
            createDirectoryResponseHeader) {
            Debug.log(createDirectoryResponseHeader);
            onSuccess();
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.deleteEntry = function(fileName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        queryPathInfo.call(this, fileName, function(
            queryPathInfoResponseHeader, queryPathInfoResponse) {
            Debug.log(queryPathInfoResponseHeader);
            Debug.log(queryPathInfoResponse);
            var file = queryPathInfoResponse.getFile();
            if (file.isDirectory()) {
                deepDelete.call(this, [file], 0, 0, [], function() {
                    onSuccess();
                }.bind(this), errorHandler);
            } else {
                deleteFile.call(this, fileName, function(deleteResponseHeader) {
                    Debug.log(deleteResponseHeader);
                    onSuccess();
                }.bind(this), errorHandler);
            }
        }.bind(this), errorHandler);
    };

    ClientImpl.prototype.move = function(source, target, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        if (getParentPath.call(this, source) === getParentPath.call(this, target)) {
            rename.call(this, source, target, function() {
                onSuccess();
            }.bind(this), errorHandler);
        } else {
            this.getMetadata(source, function(file) {
                deepCopy.call(this, [file], 0, getParentPath.call(this, target), 0, [], function() {
                    deepDelete.call(this, [file], 0, 0, [], function() {
                        onSuccess();
                    }.bind(this), errorHandler);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }
    };
    
    ClientImpl.prototype.copy = function(source, target, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        this.getMetadata(source, function(file) {
            deepCopy.call(this, [file], 0, getParentPath.call(this, target), 0, [], function() {
                onSuccess();
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    // Private functions
    
    var checkError = function(header, onError, expected) {
        var errorCode = header.getNtStyleErrorCode();
        if (expected) {
            if (errorCode === expected) {
                return true;
            } else {
                onError(errorCode + ": " + Debug.getNtStatusMessage(errorCode));
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
                onError(errorCode + ": " + Debug.getNtStatusMessage(errorCode));
                return false;
            }
        }
    };
    
    var sendType1Message = function(negotiateProtocolResponse, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupAndxRequestPacket =
                this.protocol_.createSessionSetupRequestType1Packet(
                    session, negotiateProtocolResponse);
        Debug.log(sessionSetupAndxRequestPacket);
        this.comm_.writePacket(sessionSetupAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError,
                                    Constants.NT_STATUS_MORE_PROCESSING_REQUIRED)) {
                    var sessionSetupResponse =
                            this.protocol_.parseSessionSetupResponse(packet);
                    session.setUserId(header.getUserId());
                    onSuccess(header, sessionSetupResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var sendType3Message = function(userName, password, domainName, negotiateProtocolResponse, sessionSetupResponse, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupAndxRequestPacket =
                this.protocol_.createSessionSetupRequestType3Packet(
                    session, userName, password, domainName, negotiateProtocolResponse,
                    sessionSetupResponse.getType2Message());
        Debug.log(sessionSetupAndxRequestPacket);
        this.comm_.writePacket(sessionSetupAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    session.setUserId(header.getUserId());
                    onSuccess();
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var sendSessionSetupRequestForShare = function(negotiateProtocolResponse, username, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupAndxRequestPacket =
                this.protocol_.createSessionSetupRequestSharePacket(
                    session, negotiateProtocolResponse, username);
        Debug.log(sessionSetupAndxRequestPacket);
        this.comm_.writePacket(sessionSetupAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError)) {
                    session.setUserId(header.getUserId());
                    onSuccess(header);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var sendSessionSetupRequestForUnextendedSecurity = function(negotiateProtocolResponse, username, password, domainName, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupAndxRequestPacket =
                this.protocol_.createSessionSetupRequestUnextendedSecurityPacket(
                    session, negotiateProtocolResponse, username, password, domainName);
        Debug.log(sessionSetupAndxRequestPacket);
        this.comm_.writePacket(sessionSetupAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError)) {
                    session.setUserId(header.getUserId());
                    onSuccess(header);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var connectTree = function(name, service, onSuccess, onError) {
        var session = this.client_.getSession();
        var treeConnectAndxRequestPacket =
                this.protocol_.createTreeConnectAndxRequestPacket(
                    session, name, service);
        Debug.log(treeConnectAndxRequestPacket);
        this.comm_.writePacket(treeConnectAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    session.setTreeId(header.getTreeId());
                    var treeConnectAndxResponse =
                            this.protocol_.parseTreeConnectAndxResponse(packet);
                    onSuccess(header, treeConnectAndxResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var ntCreate = function(options, onSuccess, onError) {
        var session = this.client_.getSession();
        var ntCreateAndxRequestPacket = this.protocol_.createNtCreateAndxRequestPacket(
            session, options);
        Debug.log(ntCreateAndxRequestPacket);
        this.comm_.writePacket(ntCreateAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var ntCreateAndxResponse =
                            this.protocol_.parseNtCreateAndxResponse(packet);
                    onSuccess(header, ntCreateAndxResponse);
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
        var dceRpcBindRequestPacket = this.protocol_.createDceRpcBindRequestPacket(
            session, fid);
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
                if (header.getNtStyleErrorCode() === Constants.STATUS_BUFFER_OVERFLOW) {
                    read.call(this, fid, 0, Constants.TRANSACTION_MAX_APPEND_READ_SIZE, function(buffer) {
                        var newBuffer = this.binaryUtils_.concatBuffers([packet.getData(), buffer]);
                        var dceRpcNetShareEnumAllResponse =
                                this.protocol_.parseDceRpcNetShareEnumAllResponsePacket(
                                    new Packet(newBuffer), buffer.byteLength);
                        onSuccess(header, dceRpcNetShareEnumAllResponse);
                    }.bind(this), function(error) {
                        onError(error);
                    }.bind(this));
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

    var disconnectTree = function(onSuccess, onError) {
        var session = this.client_.getSession();
        var treeDisconnectRequestPacket = this.protocol_.createTreeDisconnectRequestPacket(session);
        Debug.log(treeDisconnectRequestPacket);
        this.comm_.writePacket(treeDisconnectRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    session.setTreeId(null);
                    onSuccess(header);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var logoffAndx = function(onSuccess, onError) {
        var session = this.client_.getSession();
        var logoffAndxRequestPacket = this.protocol_.createLogoffAndxRequestPacket(session);
        this.comm_.writePacket(logoffAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
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

    var queryPathInfo = function(fileName, onSuccess, onError) {
        var session = this.client_.getSession();
        var queryPathInfoRequestPacket = this.protocol_.createQueryPathInfoRequestPacket(session, fileName);
        Debug.log(queryPathInfoRequestPacket);
        this.comm_.writePacket(queryPathInfoRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var queryPathInfoResponse =
                            this.protocol_.parseQueryPathInfoResponsePacket(packet);
                    var file = queryPathInfoResponse.getFile();
                    file.setFullFileName(fileName);
                    file.setFileName(getNameFromPath.call(this, fileName));
                    onSuccess(header, queryPathInfoResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var getNameFromPath = function(path) {
        var names = path.split("\\");
        var name = names[names.length - 1];
        return name;
    };

    var findFirst2 = function(directoryName, onSuccess, onError) {
        var session = this.client_.getSession();
        var findFirst2RequestPacket = this.protocol_.createFindFirst2RequestPacket(session, directoryName);
        Debug.log(findFirst2RequestPacket);
        this.comm_.writePacket(findFirst2RequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var findFirst2Response =
                            this.protocol_.parseFindFirst2ResponsePacket(packet);
                    onSuccess(header, findFirst2Response);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var findNext2 = function(searchId, files, hasNext, onSuccess, onError) {
        var session = this.client_.getSession();
        if (!hasNext) {
            onSuccess();
        } else {
            var findNext2RequestPacket = this.protocol_.createFindNext2RequestPacket(
                session, searchId, files[files.length - 1].getFileName());
            this.comm_.writePacket(findNext2RequestPacket, function() {
                this.comm_.readPacket(function(packet) {
                    var header = packet.getHeader();
                    if (checkError.call(this, header, onError)) {
                        var findNext2Response =
                                this.protocol_.parseFindNext2ResponsePacket(packet);
                        for (var i = 0; i < findNext2Response.getFiles().length; i++) {
                            files.push(findNext2Response.getFiles()[i]);
                        }
                        Debug.log(header);
                        Debug.log(findNext2Response);
                        findNext2.call(this, searchId, files,
                                       findNext2Response.hasNext(), onSuccess, onError);
                    }
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }
    };

    var findClose2 = function(searchId, onSuccess, onError) {
        var session = this.client_.getSession();
        var findClose2RequestPacket = this.protocol_.createFindClose2RequestPacket(session, searchId);
        this.comm_.writePacket(findClose2RequestPacket, function() {
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

    // options: truncate(boolean)
    var openFile = function(fileName, mode, options, onSuccess, onError) {
        var params = {
            flags: 0,
            extFileAttributes: Constants.SMB_EXT_FILE_ATTR_NORMAL,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createOptions: Constants.FILE_NON_DIRECTORY_FILE,
            fileName: fileName
        };
        if (mode === "READ") {
            params.desiredAccess =
                Constants.FILE_READ_DATA |
                Constants.FILE_READ_EA |
                Constants.FILE_READ_ATTRIBUTES;
            params.createDisposition = Constants.FILE_OPEN;
        } else if (mode === "WRITE") {
            params.desiredAccess =
                Constants.FILE_READ_DATA |
                Constants.FILE_WRITE_DATA |
                Constants.FILE_APPEND_DATA |
                Constants.FILE_READ_EA |
                Constants.FILE_WRITE_EA |
                Constants.FILE_READ_ATTRIBUTES |
                Constants.FILE_WRITE_ATTRIBUTES;
            if (options.truncate) {
                params.createDisposition = Constants.FILE_OVERWRITE_IF;
            } else {
                params.createDisposition = Constants.FILE_OPEN_IF;
            }
        } else {
            throw new Error("Unknown mode: " + mode);
        }
        ntCreate.call(this, params, function(
            header, ntCreateAndxResponse) {
            Debug.log(header);
            Debug.log(ntCreateAndxResponse);
            var fid = ntCreateAndxResponse.getFId();
            onSuccess(fid);
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var seek = function(fid, offset, onSuccess, onError) {
        var session = this.client_.getSession();
        var seekRequestPacket = this.protocol_.createSeekRequestPacket(
            session, fid, offset);
        this.comm_.writePacket(seekRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var seekResponse = this.protocol_.parseSeekResponsePacket(packet);
                    Debug.log(header);
                    Debug.log(seekResponse);
                    onSuccess(header, seekResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var read = function(fid, offset, length, onSuccess, onError) {
        read_.call(this, fid, offset, length, [], function(dataList) {
            var total = 0;
            for (var i = 0; i < dataList.length; i++) {
                total += dataList[i].length;
            }
            var buffer = new ArrayBuffer(total);
            var array = new Uint8Array(buffer);
            var pos = 0;
            for (i = 0; i < dataList.length; i++) {
                array.set(dataList[i], pos);
                pos += dataList[i].length;
            }
            onSuccess(buffer);
        }.bind(this), onError);
    };

    var read_ = function(fid, readOffset, remaining, dataList, onSuccess, onError) {
        var readLength = Math.min(Constants.READ_ANDX_BUFFER_SIZE, remaining);
        readAndx.call(this, fid, readOffset, readLength, function(readAndxResponseHeader, readAndxResponse) {
            var actualReadLength = readAndxResponse.getDataLength();
            readOffset += actualReadLength;
            remaining -= actualReadLength;
            if (actualReadLength === 0) {
                onSuccess(dataList);
            } else if (remaining === 0) {
                dataList.push(readAndxResponse.getData());
                onSuccess(dataList);
            } else {
                dataList.push(readAndxResponse.getData());
                read_.call(this, fid, readOffset, remaining, dataList, onSuccess, onError);
            }
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var readAndx = function(fid, offset, length, onSuccess, onError) {
        var session = this.client_.getSession();
        var readAndxRequestPacket = this.protocol_.createReadAndxRequestPacket(
            session, fid, offset, length);
        this.comm_.writePacket(readAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError)) {
                    var readAndxResponse =
                            this.protocol_.parseReadAndxResponsePacket(packet);
                    Debug.log(readAndxResponse);
                    onSuccess(header, readAndxResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var write = function(fid, offset, data, onSuccess, onError) {
        write_.call(this, fid, offset, 0, data, onSuccess, onError);
    };

    var write_ = function(fid, offset, pos, data, onSuccess, onError) {
        var writeLength = Math.min(Constants.READ_ANDX_BUFFER_SIZE, data.length - pos);
        var array = data.subarray(pos, pos + writeLength);
        writeAndx.call(this, fid, offset, array, function(writeAndxResponseHeader, writeAndxResponse) {
            var actualWriteLength = writeAndxResponse.getCount();
            offset += actualWriteLength;
            pos += actualWriteLength;
            if (pos === data.length) {
                onSuccess();
            } else {
                write_.call(this, fid, offset, pos, data, onSuccess, onError);
            }
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var writeAndx = function(fid, offset, data, onSuccess, onError) {
        var session = this.client_.getSession();
        var writeAndxRequestPacket = this.protocol_.createWriteAndxRequestPacket(
            session, fid, offset, data);
        this.comm_.writePacket(writeAndxRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError)) {
                    var writeAndxResponse = this.protocol_.parseWriteAndxResponsePacket(packet);
                    Debug.log(writeAndxResponse);
                    onSuccess(header, writeAndxResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var createDirectory_ = function(directoryName, onSuccess, onError) {
        var session = this.client_.getSession();
        var createDirectoryRequestPacket = this.protocol_.createCreateDirectoryRequestPacket(
            session, directoryName);
        this.comm_.writePacket(createDirectoryRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
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

    var deleteFile = function(fileName, onSuccess, onError) {
        var session = this.client_.getSession();
        var createDeleteRequestPacket = this.protocol_.createDeleteRequestPacket(session, fileName);
        this.comm_.writePacket(createDeleteRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
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

    var deleteDirectory = function(directoryName, onSuccess, onError) {
        var session = this.client_.getSession();
        var deleteDirectoryRequestPacket = this.protocol_.createDeleteDirectoryRequestPacket(
            session, directoryName);
        this.comm_.writePacket(deleteDirectoryRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
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

    var deepCopy = function(files, index, target, depth, stack, onSuccess, onError) {
        if (files.length === index) {
            if (depth === 0) {
                onSuccess();
            } else {
                var prev = stack.pop();
                deepCopy.call(this, prev.files, prev.index + 1, prev.target, prev.depth,
                              stack, onSuccess, onError);
            }
        } else {
            var file = files[index];
            if (file.isDirectory()) {
                // Create target directory
                var targetDirectoryName = target + "\\" + file.getFileName();
                this.createDirectory(targetDirectoryName, function() {
                    // Recursive for each child
                    this.readDirectory(file.getFullFileName(), function(children) {
                        stack.push({
                            files: files,
                            index: index,
                            target: target,
                            depth: depth
                        });
                        deepCopy.call(this, children, 0, targetDirectoryName, depth + 1, stack,
                                      onSuccess, onError);
                    }.bind(this), onError);
                }.bind(this), onError);
            } else {
                // Copy file
                this.readFile(file.getFullFileName(), 0, file.getEndOfFile(), function(buffer) {
                    var targetFileName = target + "\\" + file.getFileName();
                    this.createFile(targetFileName, function() {
                        this.writeFile(targetFileName, 0, new Uint8Array(buffer), function() {
                            deepCopy.call(this, files, index + 1, target, depth, stack, onSuccess, onError);
                        }.bind(this), onError);
                    }.bind(this), onError);
                }.bind(this), onError);
            }
        }
    };

    var deepDelete = function(files, index, depth, stack, onSuccess, onError) {
        if (files.length === index) {
            if (depth === 0) {
                onSuccess();
            } else {
                var prev = stack.pop();
                deleteDirectory.call(this, prev.files[prev.index].getFullFileName(), function(
                    deleteDirectoryResponseHeader) {
                    Debug.log(deleteDirectoryResponseHeader);
                    deepDelete.call(this, prev.files, prev.index + 1, prev.depth,
                                    stack, onSuccess, onError);
                }.bind(this), onError);
            }
        } else {
            var file = files[index];
            if (file.isDirectory()) {
                // Recursive for each child
                this.readDirectory(file.getFullFileName(), function(children) {
                    stack.push({
                        files: files,
                        index: index,
                        depth: depth
                    });
                    deepDelete.call(this, children, 0, depth + 1, stack, onSuccess, onError);
                }.bind(this), onError);
            } else {
                // Delete file
                deleteFile.call(this, file.getFullFileName(), function(deleteResponseHeader) {
                    Debug.log(deleteResponseHeader);
                    deepDelete.call(this, files, index + 1, depth, stack, onSuccess, onError);
                }.bind(this), onError);
            }
        }
    };

    var rename = function(source, target, onSuccess, onError) {
        var session = this.client_.getSession();
        var renameRequestPacket = this.protocol_.createRenameRequestPacket(session, source, target);
        this.comm_.writePacket(renameRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
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

    var getParentPath = function(path) {
        if (path === "\\") {
            return null;
        } else {
            var names = path.split("\\");
            var name = "";
            for (var i = 0; i < names.length - 1; i++) {
                if (names[i].length > 0) {
                    name += "\\" + names[i];
                }
            }
            return name;
        }
    };

    // Export
    
    Smb1.ClientImpl = ClientImpl;
    
    
})(SmbClient.Smb1,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb1.Protocol,
   SmbClient.Packet,
   SmbClient.BinaryUtils);
