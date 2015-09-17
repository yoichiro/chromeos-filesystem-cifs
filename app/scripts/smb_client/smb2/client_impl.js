(function(Smb2,
          Constants,
          Debug,
          Protocol,
          Packet,
          FileDispositionInformation,
          FileRenameInformation,
          BinaryUtils,
          Asn1Obj) {
    "use strict";
    
    // Constructor
    
    var ClientImpl = function(client) {
        this.protocol_ = new Protocol();
        this.binaryUtils_ = new BinaryUtils();
      
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
            } else if (!negotiateResponse.isSupportedMechType(Constants.ASN1_OID_NLMP)) {
                onError("The server doesn't support NLMP");
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

            var type2Message = this.protocol_.parseType2Message(sessionSetupResponse);
            Debug.outputType2MessageFlags(type2Message);

            sendType3Message.call(this, userName, password, domainName, negotiateResponse, type2Message, function() {
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
    
    ClientImpl.prototype.logout = function(onSuccess, onError) {
        var session = this.client_.getSession();
        
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        var logoffAndDisconnect = function() {
            logoff.call(this, function() {
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
        connectTree.call(this, path/*.toUpperCase()*/, function(
            treeConnectResponseHeader, treeConnectResponse) {
            Debug.log(treeConnectResponseHeader);
            Debug.log(treeConnectResponse);
            onSuccess();
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    ClientImpl.prototype.getMetadata = function(fileName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        var options = {
            desiredAccess:
                Constants.FILE_READ_ATTRIBUTES | Constants.SYNCHRONIZE,
            fileAttributes:
                Constants.SMB2_FILE_ATTRIBUTE_NORMAL,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createDisposition: Constants.FILE_OPEN,
            name: trimFirstDelimiter.call(this, fileName),
            createContexts: [
                this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
            ]
        };
        create.call(this, options, function(
            createResponseHeader, createResponse) {
            Debug.log(createResponseHeader);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            queryInfo.call(this, fileId, function(
                queryInfoResponseHeader, queryInfoResponse) {
                Debug.log(queryInfoResponseHeader);
                Debug.log(queryInfoResponse);
                close.call(this, fileId, function(closeResponseHeader) {
                    Debug.log(closeResponseHeader);
                    onSuccess(queryInfoResponse.getFile());
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.readDirectory = function(directoryName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);
        
        var options = {
            desiredAccess:
                Constants.FILE_READ_DATA | Constants.FILE_READ_ATTRIBUTES | Constants.SYNCHRONIZE,
            fileAttributes:
                Constants.SMB2_FILE_ATTRIBUTE_DIRECTORY,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createDisposition: Constants.FILE_OPEN,
            createOptions: Constants.FILE_DIRECTORY_FILE,
            name: trimFirstDelimiter.call(this, directoryName),
            createContexts: [
                this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
            ]
        };
        create.call(this, options, function(
            createResponseHeader, createResponse) {
            Debug.log(createResponseHeader);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            var files = [];
            queryDirectoryInfo.call(this, fileId, files, Constants.SMB2_RESTART_SCANS, function() {
                close.call(this, fileId, function(closeResponseHeader) {
                    Debug.log(closeResponseHeader);
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
    
    ClientImpl.prototype.readFile = function(filename, offset, length, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, filename, "READ", {}, function(fileId) {
            read.call(this, fileId, offset, length, function(buffer) {
                close.call(this, fileId, function() {
                    onSuccess(buffer);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.createFile = function(filename, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, filename, "WRITE", {truncate: false}, function(fileId) {
            close.call(this, fileId, function() {
                onSuccess();
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.truncate = function(filename, length, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, filename, "READ", {}, function(fileId) {
            read.call(this, fileId, 0, length, function(buffer) {
                close.call(this, fileId, function() {
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
                    openFile.call(this, filename, "WRITE", {
                        truncate: true
                    }, function(fileId) {
                        write.call(this, fileId, 0, newArray, function() {
                            close.call(this, fileId, function() {
                                onSuccess();
                            }.bind(this), errorHandler);
                        }.bind(this), errorHandler);
                    }.bind(this), errorHandler);
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.writeFile = function(filename, offset, array, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        openFile.call(this, filename, "WRITE", {}, function(fileId) {
            write.call(this, fileId, offset, array, function() {
                close.call(this, fileId, function() {
                    onSuccess();
                }.bind(this), errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.deleteEntry = function(filename, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        this.getMetadata(filename, function(file) {
            if (file.isDirectory()) {
                deepDelete.call(this, [file], 0, 0, [], function() {
                    onSuccess();
                }.bind(this), errorHandler);
            } else {
                deleteFile.call(this, filename, function(deleteResponseHeader) {
                    Debug.log(deleteResponseHeader);
                    onSuccess();
                }.bind(this), errorHandler);
            }
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.createDirectory = function(directoryName, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        var options = {
            desiredAccess:
                Constants.FILE_READ_DATA | Constants.FILE_READ_ATTRIBUTES | Constants.SYNCHRONIZE,
            fileAttributes:
                Constants.SMB2_FILE_ATTRIBUTE_DIRECTORY,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createDisposition: Constants.FILE_OPEN_IF,
            createOptions: Constants.FILE_DIRECTORY_FILE,
            name: trimFirstDelimiter.call(this, directoryName),
            createContexts: [
                this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
            ]
        };
        create.call(this, options, function(
            createResponseHeader, createResponse) {
            Debug.log(createResponseHeader);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            close.call(this, fileId, function(closeResponseHeader) {
                Debug.log(closeResponseHeader);
                onSuccess();
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    ClientImpl.prototype.move = function(source, target, onSuccess, onError) {
        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        if (getParentPath.call(this, source) === getParentPath.call(this, target)) {
            this.getMetadata(source, function(file) {
                rename.call(this, source, target, file.isDirectory(), function() {
                    onSuccess();
                }.bind(this), errorHandler);
            }.bind(this));
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

    var sendType3Message = function(userName, password, domainName, negotiateResponse, type2Message, onSuccess, onError) {
        var session = this.client_.getSession();
        var sessionSetupRequestPacket =
                this.protocol_.createSessionSetupRequestType3Packet(
                    session, userName, password, domainName, negotiateResponse,
                    type2Message);
        Debug.log(sessionSetupRequestPacket);
        this.comm_.writePacket(sessionSetupRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var sessionSetupResponse =
                            this.protocol_.parseSessionSetupResponse(packet);
                    var securityBlob = sessionSetupResponse.getSecurityBlob();
                    var root = Asn1Obj.load(securityBlob);
                    Debug.log(root);
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

    var logoff = function(onSuccess, onError) {
        var session = this.client_.getSession();
        var logoffRequestPacket = this.protocol_.createLogoffRequestPacket(session);
        this.comm_.writePacket(logoffRequestPacket, function() {
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
    
    var queryInfo = function(fileId, onSuccess, onError) {
        var session = this.client_.getSession();
        var queryInfoRequestPacket = this.protocol_.createQueryInfoRequestPacket(session, fileId);
        Debug.log(queryInfoRequestPacket);
        this.comm_.writePacket(queryInfoRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (checkError.call(this, header, onError)) {
                    var queryInfoResponse =
                            this.protocol_.parseQueryInfoResponsePacket(packet);
                    var file = queryInfoResponse.getFile();
                    file.setFileName(getNameFromPath.call(this, file.getFullFileName()));
                    onSuccess(header, queryInfoResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var queryDirectoryInfo = function(fileId, files, flags, onSuccess, onError) {
        var session = this.client_.getSession();
        var queryDirectoryInfoRequestPacket = this.protocol_.createQueryDirectoryInfoRequestPacket(
            session, fileId, flags);
        this.comm_.writePacket(queryDirectoryInfoRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                if (header.getStatus() === Constants.SMB2_STATUS_NO_MORE_FILES) {
                    onSuccess();
                } else {
                    if (checkError.call(this, header, onError)) {
                        var queryDirectoryInfoResponse =
                                this.protocol_.parseQueryDirectoryInfoResponsePacket(packet);
                        for (var i = 0; i < queryDirectoryInfoResponse.getFiles().length; i++) {
                            files.push(queryDirectoryInfoResponse.getFiles()[i]);
                        }
                        Debug.log(header);
                        Debug.log(queryDirectoryInfoResponse);
                        queryDirectoryInfo.call(this, fileId, files, 0, onSuccess, onError);
                    }
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    // options: truncate(boolean)
    var openFile = function(filename, mode, options, onSuccess, onError) {
        var params = {
            fileAttributes:
                Constants.SMB2_FILE_ATTRIBUTE_NORMAL,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createOptions: Constants.FILE_NON_DIRECTORY_FILE,
            name: trimFirstDelimiter.call(this, filename),
            createContexts: [
                this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
            ]
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
        } else if (mode === "DELETE") {
            params.desiredAccess = Constants.DELETE;
            params.createDisposition = Constants.FILE_OPEN;
        } else {
            throw new Error("Unknown mode: " + mode);
        }
        create.call(this, params, function(
            header, createResponse) {
            Debug.log(header);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            onSuccess(fileId);
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var read = function(fileId, offset, length, onSuccess, onError) {
        read_.call(this, fileId, offset, length, [], function(dataList) {
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

    var read_ = function(fileId, readOffset, remaining, dataList, onSuccess, onError) {
        var readLength = Math.min(Constants.SMB2_READ_BUFFER_SIZE, remaining);
        doRead.call(this, fileId, readOffset, readLength, function(readResponseHeader, readResponse) {
            if (readResponseHeader.getStatus() === Constants.NT_STATUS_END_OF_FILE) {
                onSuccess(dataList);
            } else {
                var actualReadLength = readResponse.getDataLength();
                readOffset += actualReadLength;
                remaining -= actualReadLength;
                if (actualReadLength === 0) {
                    onSuccess(dataList);
                } else if (remaining === 0) {
                    dataList.push(readResponse.getData());
                    onSuccess(dataList);
                } else {
                    dataList.push(readResponse.getData());
                    read_.call(this, fileId, readOffset, remaining, dataList, onSuccess, onError);
                }
            }
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var doRead = function(fileId, offset, length, onSuccess, onError) {
        var session = this.client_.getSession();
        var readRequestPacket = this.protocol_.createReadRequestPacket(
            session, fileId, offset, length);
        this.comm_.writePacket(readRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (header.getStatus() === Constants.NT_STATUS_END_OF_FILE) {
                    onSuccess(header, null);
                } else if (checkError.call(this, header, onError)) {
                    var readResponse = this.protocol_.parseReadResponsePacket(packet);
                    Debug.log(readResponse);
                    onSuccess(header, readResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var write = function(fileId, offset, data, onSuccess, onError) {
        write_.call(this, fileId, offset, 0, data, onSuccess, onError);
    };

    var write_ = function(fileId, offset, pos, data, onSuccess, onError) {
        var writeLength = Math.min(Constants.SMB2_READ_BUFFER_SIZE, data.length - pos);
        var array = data.subarray(pos, pos + writeLength);
        doWrite.call(this, fileId, offset, array, function(writeResponseHeader, writeResponse) {
            var actualWriteLength = writeResponse.getCount();
            offset += actualWriteLength;
            pos += actualWriteLength;
            if (pos === data.length) {
                onSuccess();
            } else {
                write_.call(this, fileId, offset, pos, data, onSuccess, onError);
            }
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var doWrite = function(fileId, offset, data, onSuccess, onError) {
        var session = this.client_.getSession();
        var writeRequestPacket = this.protocol_.createWriteRequestPacket(
            session, fileId, offset, data);
        this.comm_.writePacket(writeRequestPacket, function() {
            this.comm_.readPacket(function(packet) {
                var header = packet.getHeader();
                Debug.log(header);
                if (checkError.call(this, header, onError)) {
                    var writeResponse = this.protocol_.parseWriteResponsePacket(packet);
                    Debug.log(writeResponse);
                    onSuccess(header, writeResponse);
                }
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var deleteFile = function(filename, onSuccess, onError) {
        var session = this.client_.getSession();
        openFile.call(this, filename, "DELETE", {}, function(fileId) {
            var fileDispositionInformation = new FileDispositionInformation();
            var setInfoRequestPacket = this.protocol_.createSetInfoRequestPacket(
                session, fileId, fileDispositionInformation);
            this.comm_.writePacket(setInfoRequestPacket, function() {
                this.comm_.readPacket(function(packet) {
                    var header = packet.getHeader();
                    Debug.log(header);
                    if (checkError.call(this, header, onError)) {
                        close.call(this, fileId, function() {
                            onSuccess();
                        }.bind(this), function(error) {
                            onError(error);
                        }.bind(this));
                    }
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };

    var deleteDirectory = function(directoryName, onSuccess, onError) {
        var session = this.client_.getSession();

        var options = {
            desiredAccess: Constants.DELETE,
            fileAttributes:
                Constants.SMB2_FILE_ATTRIBUTE_DIRECTORY,
            shareAccess:
                Constants.FILE_SHARE_READ |
                Constants.FILE_SHARE_WRITE |
                Constants.FILE_SHARE_DELETE,
            createDisposition: Constants.FILE_OPEN,
            createOptions: Constants.FILE_DIRECTORY_FILE,
            name: trimFirstDelimiter.call(this, directoryName),
            createContexts: [
                this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
            ]
        };
        create.call(this, options, function(
            createResponseHeader, createResponse) {
            Debug.log(createResponseHeader);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            var fileDispositionInformation = new FileDispositionInformation();
            var setInfoRequestPacket = this.protocol_.createSetInfoRequestPacket(
                session, fileId, fileDispositionInformation);
            this.comm_.writePacket(setInfoRequestPacket, function() {
                this.comm_.readPacket(function(packet) {
                    var header = packet.getHeader();
                    Debug.log(header);
                    if (checkError.call(this, header, onError)) {
                        close.call(this, fileId, function() {
                            onSuccess();
                        }.bind(this), function(error) {
                            onError(error);
                        }.bind(this));
                    }
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                onError(error);
            }.bind(this));
        }.bind(this), function(error) {
            onError(error);
        }.bind(this));
    };
    
    var deepDelete = function(files, index, depth, stack, onSuccess, onError) {
        if (files.length === index) {
            if (depth === 0) {
                onSuccess();
            } else {
                var prev = stack.pop();
                deleteDirectory.call(this, prev.files[prev.index].getFullFileName(), function() {
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
    
    var rename = function(source, target, isDirectory, onSuccess, onError) {
        var session = this.client_.getSession();
        var options = null;
        if (isDirectory) {
            options = {
                desiredAccess:
                    Constants.FILE_READ_DATA | Constants.FILE_READ_ATTRIBUTES | Constants.SYNCHRONIZE,
                fileAttributes:
                    Constants.SMB2_FILE_ATTRIBUTE_DIRECTORY,
                shareAccess:
                    Constants.FILE_SHARE_READ |
                    Constants.FILE_SHARE_WRITE |
                    Constants.FILE_SHARE_DELETE,
                createDisposition: Constants.FILE_OPEN,
                createOptions: Constants.FILE_DIRECTORY_FILE,
                name: trimFirstDelimiter.call(this, source),
                createContexts: [
                    this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
                ]
            };
        } else {
            options = {
                desiredAccess:
                    Constants.FILE_READ_DATA |
                    Constants.FILE_WRITE_DATA |
                    Constants.FILE_APPEND_DATA |
                    Constants.FILE_READ_EA |
                    Constants.FILE_WRITE_EA |
                    Constants.FILE_READ_ATTRIBUTES |
                    Constants.FILE_WRITE_ATTRIBUTES,
                fileAttributes:
                    Constants.SMB2_FILE_ATTRIBUTE_NORMAL,
                shareAccess:
                    Constants.FILE_SHARE_READ |
                    Constants.FILE_SHARE_WRITE |
                    Constants.FILE_SHARE_DELETE,
                createDisposition: Constants.FILE_OPEN,
                name: trimFirstDelimiter.call(this, source),
                createContexts: [
                    this.protocol_.createCreateContext(0, Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST, null)
                ]
            };
        }
        create.call(this, options, function(
            createResponseHeader, createResponse) {
            Debug.log(createResponseHeader);
            Debug.log(createResponse);
            var fileId = createResponse.getFileId();
            var fileRenameInformation = new FileRenameInformation();
            fileRenameInformation.setFilename(target);
            var setInfoRequestPacket = this.protocol_.createSetInfoRequestPacket(
                session, fileId, fileRenameInformation);
            this.comm_.writePacket(setInfoRequestPacket, function() {
                this.comm_.readPacket(function(packet) {
                    var header = packet.getHeader();
                    Debug.log(header);
                    if (checkError.call(this, header, onError)) {
                        close.call(this, fileId, function() {
                            onSuccess();
                        }.bind(this), function(error) {
                            onError(error);
                        }.bind(this));
                    }
                }.bind(this), function(error) {
                    onError(error);
                }.bind(this));
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

    var getNameFromPath = function(path) {
        var names = path.split("\\");
        var name = names[names.length - 1];
        return name;
    };
    
    var trimFirstDelimiter = function(path) {
        if (path && path.charAt(0) === '\\') {
            return path.substring(1);
        } else {
            return path;
        }
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
    
    Smb2.ClientImpl = ClientImpl;
    
    
})(SmbClient.Smb2,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb2.Protocol,
   SmbClient.Packet,
   SmbClient.Smb2.Models.FileDispositionInformation,
   SmbClient.Smb2.Models.FileRenameInformation,
   SmbClient.BinaryUtils,
   SmbClient.Spnego.Asn1Obj);
