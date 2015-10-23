(function(Smb2,
          Constants,
          Packet,
          Header,
          Types,
          NegotiateResponse,
          Type1Message,
          SessionSetupRequest,
          SessionSetupResponse,
          Type2Message,
          Type3Message,
          NtlmV2Hash,
          LmV2Response,
          NtlmV2Response,
          LmHash,
          LmResponse,
          NtlmHash,
          TypeMessageUtils,
          TreeConnectRequest,
          TreeConnectResponse,
          CreateRequest,
          CreateContext,
          CreateResponse,
          IoctlRequest,
          DceRpcBind,
          IoctlResponse,
          DceRpcBindAck,
          DceRpcNetShareEnumAllRequest,
          DceRpcNetShareEnumAllResponse,
          CloseRequest,
          EmptyRequest,
          QueryInfoRequest,
          QueryInfoResponse,
          QueryDirectoryInfoRequest,
          QueryDirectoryInfoResponse,
          ReadRequest,
          ReadResponse,
          WriteRequest,
          WriteResponse,
          SetInfoRequest,
          Asn1Obj,
          Debug) {

    "use strict";

    // Constructor

    var Protocol = function() {
        this.types_ = new Types();
        this.typeMessageUtils_ = new TypeMessageUtils();

        this.sequenceNumber_ = 1;
    };

    // Public functions
    
    Protocol.prototype.parseNegotiateResponse = function(packet) {
        var negotiateResponse = new NegotiateResponse();
        negotiateResponse.load(packet);
        return negotiateResponse;
    };

    /*jslint bitwise: true */
    Protocol.prototype.createSessionSetupRequestType1Packet = function(session, negotiateResponse) {
        var header = createHeader.call(this, Constants.SMB2_SESSION_SETUP, {
            processId: session.getProcessId()
        });

        var type1Message = this.typeMessageUtils_.createType1Message();
        
        var root = Asn1Obj.create(Constants.ASN1_TAG_APPLICATION_0_FOR_BIND_REQUEST)
            .addChild(
                Asn1Obj.create(Constants.ASN1_TAG_OBJECT_IDENTIFIER)
                    .setValue(Constants.ASN1_OID_SPNEGO_BINARY)
            )
            .addChild(
                Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE_OF_SEQUENCE_OF_OID_0)
                    .addChild(
                        Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE)
                            .addChild(
                                Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE_OF_SEQUENCE_OF_OID_0)
                                    .addChild(
                                        Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE)
                                            .addChild(
                                                Asn1Obj.create(Constants.ASN1_TAG_OBJECT_IDENTIFIER)
                                                    .setValue(Constants.ASN1_OID_NLMP_BINARY)
                                            )
                                    )
                            )
                            .addChild(
                                Asn1Obj.create(Constants.ASN1_TAG_RETURN_RESULT_STRUCTURE_WITHIN_COMPONENT)
                                    .addChild(
                                        Asn1Obj.create(Constants.ASN1_TAG_OCTET_STRING)
                                            .setValue(new Uint8Array(type1Message.createArrayBuffer()))
                                    )
                            )
                    )
            );

        var sessionSetupRequest = new SessionSetupRequest();
        sessionSetupRequest.load(negotiateResponse, {
            ntlmMessage: root
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, sessionSetupRequest);
        return packet;
    };
    
    Protocol.prototype.parseSessionSetupResponse = function(packet) {
        var sessionSetupResponse = new SessionSetupResponse();
        sessionSetupResponse.load(packet);
        return sessionSetupResponse;
    };
    
    Protocol.prototype.parseType2Message = function(sessionSetupResponse) {
        var securityBlob = sessionSetupResponse.getSecurityBlob();
        var root = Asn1Obj.load(securityBlob);
        Debug.log(root);
        var children = root.getChildren()[0].getChildren();
        Debug.info("Response OID = " + children[1].getChildren()[0].getValueAsObjectIdentifier());
        var type2MessageBuffer = children[2].getChildren()[0].getValue();
        var type2Message = new Type2Message();
        type2Message.load(new Uint8Array(type2MessageBuffer));
        return type2Message;
    };
    
    Protocol.prototype.createSessionSetupRequestType3Packet = function(
            session, username, password, domainName, negotiateResponse, type2Message, lmCompatibilityLevel) {
        var header = createHeader.call(this, Constants.SMB2_SESSION_SETUP, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var serverChallenge = type2Message.getChallenge();

        var type3Message = this.typeMessageUtils_.createType3Message(
            username, password, domainName, serverChallenge, type2Message, lmCompatibilityLevel);
        
        var root = Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE_OF_SEQUENCE_OF_OID_1)
            .addChild(
                Asn1Obj.create(Constants.ASN1_TAG_SEQUENCE)
                    .addChild(
                        Asn1Obj.create(Constants.ASN1_TAG_RETURN_RESULT_STRUCTURE_WITHIN_COMPONENT)
                            .addChild(
                                Asn1Obj.create(Constants.ASN1_TAG_OCTET_STRING)
                                    .setValue(new Uint8Array(type3Message.createArrayBuffer()))
                            )
                    )
                    // TODO: Should append mechListMIC value
                    /*
                    .addChild(
                        Asn1Obj.create(Constants.ASN1_TAG_HANDLE_MICROSOFT_V3_SASL_BIND_REQUEST)
                            .addChild(
                                Asn1Obj.create(Constants.ASN1_TAG_OCTET_STRING)
                                    .setValue(new Uint8Array([0]))
                            )
                    )
                    */
            );

        var sessionSetupRequest = new SessionSetupRequest();
        sessionSetupRequest.load(negotiateResponse, {
            ntlmMessage: root
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, sessionSetupRequest);
        return packet;
    };
    
    Protocol.prototype.createTreeConnectRequestPacket = function(session, path) {
        var header = createHeader.call(this, Constants.SMB2_TREE_CONNECT, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var treeConnectRequest = new TreeConnectRequest();
        treeConnectRequest.setPath("\\\\" + session.getServerName() + "\\" + path);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, treeConnectRequest);
        return packet;
    };

    Protocol.prototype.parseTreeConnectResponse = function(packet) {
        var treeConnectResponse = new TreeConnectResponse();
        treeConnectResponse.load(packet);
        return treeConnectResponse;
    };

    // options: (requestedOpLockLevel), (impersonationLevel), desiredAccess, fileAttributes, 
    //          shareAccess, createDisposition, (createOptions), name, (createContexts)
    Protocol.prototype.createCreateRequestPacket = function(session, options) {
        var header = createHeader.call(this, Constants.SMB2_CREATE, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var createRequest = new CreateRequest();
        createRequest.setRequestedOplockLevel(options.requestedOplockLevel || 0);
        createRequest.setImpersonationLevel(options.impersonationLevel || Constants.SEC_IMPERSONATE);
        createRequest.setDesiredAccess(options.desiredAccess);
        createRequest.setFileAttributes(options.fileAttributes);
        createRequest.setShareAccess(options.shareAccess);
        createRequest.setCreateDisposition(options.createDisposition);
        createRequest.setCreateOptions(options.createOptions || 0);
        createRequest.setName(options.name);
        createRequest.setCreateContexts(options.createContexts || []);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, createRequest);
        return packet;
    };
    
    Protocol.prototype.createCreateContext = function(next, name, data) {
        var createContext = new CreateContext();
        createContext.set(next, name, data);
        return createContext;
    };
    
    Protocol.prototype.parseCreateResponse = function(packet) {
        var createResponse = new CreateResponse();
        createResponse.load(packet);
        return createResponse;
    };
    
    Protocol.prototype.createDceRpcBindRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB2_IOCTL, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var ioctlRequest = new IoctlRequest();
        ioctlRequest.setFileId(fid);
        var dceRpcBind = new DceRpcBind();
        ioctlRequest.setSubMessage(dceRpcBind);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, ioctlRequest);
        return packet;
    };
    
    Protocol.prototype.parseDceRpcBindAckPacket = function(packet) {
        var ioctlResponse = new IoctlResponse();
        ioctlResponse.load(packet, 0);
        var dataArray = ioctlResponse.getBuffer();
        var dceRpcBindAck = new DceRpcBindAck();
        dceRpcBindAck.load(dataArray);
        return dceRpcBindAck;
    };

    Protocol.prototype.createDceRpcNetShareEnumAllRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB2_IOCTL, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var ioctlRequest = new IoctlRequest();
        ioctlRequest.setFileId(fid);
        var dceRpcNetShareEnumAll = new DceRpcNetShareEnumAllRequest();
        dceRpcNetShareEnumAll.setServerName(session.getServerName());
        ioctlRequest.setSubMessage(dceRpcNetShareEnumAll);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, ioctlRequest);
        return packet;
    };

    Protocol.prototype.parseDceRpcNetShareEnumAllResponsePacket = function(packet, appendedDataCount) {
        var ioctlResponse = new IoctlResponse();
        ioctlResponse.load(packet, appendedDataCount);
        var dataArray = ioctlResponse.getBuffer();
        var dataOffset = ioctlResponse.getOutputOffset();
        var dceRpcNetShareEnumAllResponse = new DceRpcNetShareEnumAllResponse();
        dceRpcNetShareEnumAllResponse.load(dataArray, dataOffset);
        return dceRpcNetShareEnumAllResponse;
    };

    Protocol.prototype.createCloseRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB2_CLOSE, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var closeRequest = new CloseRequest();
        closeRequest.setFileId(fid);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, closeRequest);
        return packet;
    };
    
    Protocol.prototype.createTreeDisconnectRequestPacket = function(session) {
        var header = createHeader.call(this, Constants.SMB2_TREE_DISCONNECT, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var emptyRequest = new EmptyRequest();

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, emptyRequest);
        return packet;
    };

    Protocol.prototype.createLogoffRequestPacket = function(session) {
        var header = createHeader.call(this, Constants.SMB2_LOGOFF, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var emptyRequest = new EmptyRequest();

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, emptyRequest);
        return packet;
    };
    
    Protocol.prototype.createQueryInfoRequestPacket = function(session, fileId, fileInfoClass) {
        var header = createHeader.call(this, Constants.SMB2_QUERY_INFO, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var queryInfoRequest = new QueryInfoRequest();
        queryInfoRequest.setFileId(fileId);
        queryInfoRequest.setFileInfoClass(fileInfoClass);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, queryInfoRequest);
        return packet;
    };
    
    Protocol.prototype.parseQueryInfoResponsePacket = function(packet, fileInfoClass) {
        var queryInfoResponse = new QueryInfoResponse();
        queryInfoResponse.load(packet, fileInfoClass);
        return queryInfoResponse;
    };
    
    Protocol.prototype.createQueryDirectoryInfoRequestPacket = function(session, fileId, flags) {
        var header = createHeader.call(this, Constants.SMB2_QUERY_DIRECTORY_INFO, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var queryDirectoryInfoRequest = new QueryDirectoryInfoRequest();
        queryDirectoryInfoRequest.setFileId(fileId);
        queryDirectoryInfoRequest.setFlags(flags);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, queryDirectoryInfoRequest);
        return packet;
    };
    
    Protocol.prototype.parseQueryDirectoryInfoResponsePacket = function(packet) {
        var queryDirectoryInfoResponse = new QueryDirectoryInfoResponse();
        queryDirectoryInfoResponse.load(packet);
        return queryDirectoryInfoResponse;
    };
    
    Protocol.prototype.createReadRequestPacket = function(
        session, fileId, offset, length) {
        var header = createHeader.call(this, Constants.SMB2_READ, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var readRequest = new ReadRequest();
        readRequest.setFileId(fileId);
        readRequest.setOffset(offset);
        readRequest.setLength(length);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, readRequest);
        return packet;
    };
    
    Protocol.prototype.parseReadResponsePacket = function(packet) {
        var readResponse = new ReadResponse();
        readResponse.load(packet);
        return readResponse;
    };

    Protocol.prototype.createWriteRequestPacket = function(session, fileId, offset, data) {
        var header = createHeader.call(this, Constants.SMB2_WRITE, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var writeRequest = new WriteRequest();
        writeRequest.setFileId(fileId);
        writeRequest.setOffset(offset);
        writeRequest.setData(data);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, writeRequest);
        return packet;
    };

    Protocol.prototype.parseWriteResponsePacket = function(packet) {
        var writeResponse = new WriteResponse();
        writeResponse.load(packet);
        return writeResponse;
    };
    
    Protocol.prototype.createSetInfoRequestPacket = function(session, fileId, fileInfoClass) {
        var header = createHeader.call(this, Constants.SMB2_SET_INFO, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });
        
        var setInfoRequest = new SetInfoRequest();
        setInfoRequest.setFileId(fileId);
        setInfoRequest.setFileInfoClass(fileInfoClass);
        
        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB2, header, setInfoRequest);
        return packet;
    };
    
    // Private functions

    // options: userId
    var createHeader = function(command, options) {
        var userId = options.userId || 0;
        var treeId = options.treeId || 0;
        var processId = options.processId || 0;

        var header = new Header();
        header.setCommand(command);
        header.setFlags(0);
        header.setChannelSequence(0);
        header.setMessageId(this.sequenceNumber_);
        header.setTreeId(treeId);
        header.setProcessId(processId);
        header.setSessionId(userId);

        this.sequenceNumber_++;

        return header;
    };

    // Export

    Smb2.Protocol = Protocol;

})(SmbClient.Smb2,
   SmbClient.Constants,
   SmbClient.Packet,
   SmbClient.Smb2.Models.Header,
   SmbClient.Types,
   SmbClient.Smb2.Models.NegotiateResponse,
   SmbClient.Auth.Type1Message,
   SmbClient.Smb2.Models.SessionSetupRequest,
   SmbClient.Smb2.Models.SessionSetupResponse,
   SmbClient.Auth.Type2Message,
   SmbClient.Auth.Type3Message,
   SmbClient.Auth.NtlmV2Hash,
   SmbClient.Auth.LmV2Response,
   SmbClient.Auth.NtlmV2Response,
   SmbClient.Auth.LmHash,
   SmbClient.Auth.LmResponse,
   SmbClient.Auth.NtlmHash,
   SmbClient.Auth.TypeMessageUtils,
   SmbClient.Smb2.Models.TreeConnectRequest,
   SmbClient.Smb2.Models.TreeConnectResponse,
   SmbClient.Smb2.Models.CreateRequest,
   SmbClient.Smb2.Models.CreateContext,
   SmbClient.Smb2.Models.CreateResponse,
   SmbClient.Smb2.Models.IoctlRequest,
   SmbClient.DceRpc.DceRpcBind,
   SmbClient.Smb2.Models.IoctlResponse,
   SmbClient.DceRpc.DceRpcBindAck,
   SmbClient.DceRpc.DceRpcNetShareEnumAllRequest,
   SmbClient.DceRpc.DceRpcNetShareEnumAllResponse,
   SmbClient.Smb2.Models.CloseRequest,
   SmbClient.Smb2.Models.EmptyRequest,
   SmbClient.Smb2.Models.QueryInfoRequest,
   SmbClient.Smb2.Models.QueryInfoResponse,
   SmbClient.Smb2.Models.QueryDirectoryInfoRequest,
   SmbClient.Smb2.Models.QueryDirectoryInfoResponse,
   SmbClient.Smb2.Models.ReadRequest,
   SmbClient.Smb2.Models.ReadResponse,
   SmbClient.Smb2.Models.WriteRequest,
   SmbClient.Smb2.Models.WriteResponse,
   SmbClient.Smb2.Models.SetInfoRequest,
   SmbClient.Spnego.Asn1Obj,
   SmbClient.Debug);
