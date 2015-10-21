(function(Smb1,
          Constants,
          Packet,
          Header,
          Types,
          EchoRequest,
          NegotiateProtocolRequest,
          NegotiateProtocolResponse,
          SessionSetupAndxRequest,
          Type1Message,
          SessionSetupAndxResponse,
          NtlmV2Hash,
          LmV2Response,
          Debug,
          NtlmV2Response,
          LmHash,
          LmResponse,
          NtlmHash,
          Type3Message,
          TypeMessageUtils,
          TreeConnectAndxRequest,
          TreeConnectAndxResponse,
          NtCreateAndxRequest,
          NtCreateAndxResponse,
          TransactionRequest,
          DceRpcBind,
          TransactionResponse,
          DceRpcBindAck,
          DceRpcNetShareEnumAllRequest,
          DceRpcNetShareEnumAllResponse,
          CloseRequest,
          QueryPathInfoRequest,
          QueryPathInfoResponse,
          FindFirst2Request,
          FindFirst2Response,
          FindNext2Request,
          FindNext2Response,
          FindClose2Request,
          SeekRequest,
          SeekResponse,
          ReadAndxRequest,
          ReadAndxResponse,
          WriteAndxRequest,
          WriteAndxResponse,
          CreateDirectoryRequest,
          DeleteRequest,
          DeleteDirectoryRequest,
          RenameRequest,
          EmptyRequest,
          LogoffAndxRequest) {

    "use strict";

    // Constructor

    var Protocol = function() {
        this.types_ = new Types();
        this.typeMessageUtils_ = new TypeMessageUtils();

        this.sequenceNumber_ = 1;
    };

    // Public functions

    // dialects: array of string
    Protocol.prototype.createNegotiateProtocolRequestPacket = function(session, dialects) {
        var header = createHeader.call(this, Constants.SMB_COM_NEGOTIATE, {
            processId: session.getProcessId()
        });
        var negotiateProtocolRequest = new NegotiateProtocolRequest();
        negotiateProtocolRequest.setDialects(dialects);
        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, negotiateProtocolRequest);
        return packet;
    };

    Protocol.prototype.parseNegotiateProtocolResponse = function(packet) {
        var negotiateProtocolResponse = new NegotiateProtocolResponse();
        negotiateProtocolResponse.load(packet);
        return negotiateProtocolResponse;
    };

    /*jslint bitwise: true */
    Protocol.prototype.createSessionSetupRequestType1Packet = function(session, negotiateProtocolResponse) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {
            processId: session.getProcessId()
        });

        var type1Message = new Type1Message();
        type1Message.setFlag(
              Constants.NTLMSSP_NEGOTIATE_UNICODE
            | Constants.NTLMSSP_REQUEST_TARGET
            | Constants.NTLMSSP_NEGOTIATE_NTLM
            | Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_NTLM2_KEY
            | Constants.NTLMSSP_NEGOTIATE_128
        );
        type1Message.setSuppliedDomain("?");
        type1Message.setSuppliedWorkstation("FSP_CIFS");

        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, {
            extendedSecurity: true,
            ntlmMessage: type1Message
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, sessionSetupAndxRequest);
        return packet;
    };
    
    Protocol.prototype.createSessionSetupRequestSharePacket = function(session, negotiateProtocolResponse, username) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {
            processId: session.getProcessId()
        });
        
        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, {
            extendedSecurity: false,
            caseInsensitivePassword: new Uint8Array(new ArrayBuffer(0)),
            caseSensitivePassword: new Uint8Array(new ArrayBuffer(0)),
            accountName: username.toUpperCase(),
            primaryDomain: "?"
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, sessionSetupAndxRequest);
        return packet;
    };
    
    Protocol.prototype.createSessionSetupRequestUnextendedSecurityPacket = function(session, negotiateProtocolResponse, username, password, domainName) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {
            processId: session.getProcessId()
        });
        
        var serverChallenge = negotiateProtocolResponse.getEncryptionKey();
        // LMv1 and NTLMv1
        var lmHashObj = new LmHash();
        var lmHash = lmHashObj.create(password);
        var lmResponseObj = new LmResponse();
        var lmResponse = lmResponseObj.create(lmHash, serverChallenge);

        var ntlmHashObj = new NtlmHash();
        var ntlmHash = ntlmHashObj.create(password);
        var ntlmResponseObj = new LmResponse();
        var ntlmResponse = ntlmResponseObj.create(ntlmHash, serverChallenge);
        
        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, {
            extendedSecurity: false,
            caseInsensitivePassword: new Uint8Array(lmResponse),
            caseSensitivePassword: new Uint8Array(ntlmResponse),
            accountName: username.toUpperCase(),
            primaryDomain: domainName
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, sessionSetupAndxRequest);
        return packet;
    };

    Protocol.prototype.parseSessionSetupResponse = function(packet) {
        var sessionSetupAndxResponse = new SessionSetupAndxResponse();
        sessionSetupAndxResponse.load(packet);
        return sessionSetupAndxResponse;
    };

    Protocol.prototype.createSessionSetupRequestType3Packet = function(
            session, username, password, domainName, negotiateProtocolResponse, type2Message, lmCompatibilityLevel) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var serverChallenge = type2Message.getChallenge();

        var type3Message = this.typeMessageUtils_.createType3Message(
            username, password, domainName, serverChallenge, type2Message, lmCompatibilityLevel);

        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, {
            extendedSecurity: true,
            ntlmMessage: type3Message
        });

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, sessionSetupAndxRequest);
        return packet;
    };

    // message: String
    Protocol.prototype.createEchoPacket = function(message, echoCount, userId) {
        var header = createHeader.call(this, Constants.SMB_COM_ECHO, {
            userId: userId
        });

        var echoRequest = new EchoRequest();
        echoRequest.setMessage(message);
        echoRequest.setEchoCount(echoCount);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, echoRequest);
        return packet;
    };

    Protocol.prototype.createTreeConnectAndxRequestPacket = function(session, path, service) {
        var header = createHeader.call(this, Constants.SMB_COM_TREE_CONNECT_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var treeConnectAndxRequest = new TreeConnectAndxRequest();
        treeConnectAndxRequest.setPath("\\\\" + session.getServerName() + "\\" + path);
        treeConnectAndxRequest.setService(service);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, treeConnectAndxRequest);
        return packet;
    };

    Protocol.prototype.parseTreeConnectAndxResponse = function(packet) {
        var treeConnectAndxResponse = new TreeConnectAndxResponse();
        treeConnectAndxResponse.load(packet);
        return treeConnectAndxResponse;
    };

    // params: flags, rootDirectoryFId, desiredAccess, (allocationSize),
    //         extFileAttributes, shareAccess, createDisposition, createOptions,
    //         (impersonationLevel), (securityFlags), fileName
    Protocol.prototype.createNtCreateAndxRequestPacket = function(session, params) {
        var header = createHeader.call(this, Constants.SMB_COM_NT_CREATE_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var ntCreateAndxRequest = new NtCreateAndxRequest();
        ntCreateAndxRequest.setFlags(params.flags || 0);
        ntCreateAndxRequest.setRootDirectoryFId(params.rootDirectoryFId || 0);
        ntCreateAndxRequest.setDesiredAccess(params.desiredAccess |
                                             Constants.FILE_READ_DATA |
                                             Constants.FILE_READ_EA |
                                             Constants.FILE_READ_ATTRIBUTES);
        ntCreateAndxRequest.setAllocationSize(params.allocationSize || 0);
        ntCreateAndxRequest.setExtFileAttributes(params.extFileAttributes || 0);
        ntCreateAndxRequest.setShareAccess(params.shareAccess || 0);
        ntCreateAndxRequest.setCreateDisposition(params.createDisposition || 0);
        ntCreateAndxRequest.setCreateOptions(params.createOptions || 0);
        ntCreateAndxRequest.setImpersonationLevel(params.impersonationLevel ||
                                                  Constants.SEC_IMPERSONATE);
        ntCreateAndxRequest.setSecurityFlags(params.securityFlags ||
                                             (Constants.SMB_SECURITY_CONTEXT_TRACKING |
                                              Constants.SMB_SECURITY_EFFECTIVE_ONLY));
        ntCreateAndxRequest.setFileName(params.fileName);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, ntCreateAndxRequest);
        return packet;
    };

    Protocol.prototype.parseNtCreateAndxResponse = function(packet) {
        var ntCreateAndxResponse = new NtCreateAndxResponse();
        ntCreateAndxResponse.load(packet);
        return ntCreateAndxResponse;
    };

    Protocol.prototype.createDceRpcBindRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        transactionRequest.setTransactionName("\\PIPE\\");
        var dceRpcBind = new DceRpcBind();
        dceRpcBind.setFId(fid);
        transactionRequest.setSubMessage(dceRpcBind);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseDceRpcBindAckPacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet, 0);
        var dataArray = transactionResponse.getData();
        var dceRpcBindAck = new DceRpcBindAck();
        dceRpcBindAck.load(dataArray);
        return dceRpcBindAck;
    };

    Protocol.prototype.createDceRpcNetShareEnumAllRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        transactionRequest.setTransactionName("\\PIPE\\");
        var dceRpcNetShareEnumAll = new DceRpcNetShareEnumAllRequest();
        dceRpcNetShareEnumAll.setFId(fid);
        dceRpcNetShareEnumAll.setServerName(session.getServerName());
        transactionRequest.setSubMessage(dceRpcNetShareEnumAll);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseDceRpcNetShareEnumAllResponsePacket = function(packet, appendedDataCount) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet, appendedDataCount);
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var dceRpcNetShareEnumAllResponse = new DceRpcNetShareEnumAllResponse();
        dceRpcNetShareEnumAllResponse.load(dataArray, dataOffset);
        return dceRpcNetShareEnumAllResponse;
    };
    
    Protocol.prototype.createCloseRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_CLOSE, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var closeRequest = new CloseRequest();
        closeRequest.setFId(fid);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, closeRequest);
        return packet;
    };

    Protocol.prototype.createQueryPathInfoRequestPacket = function(session, fileName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var queryPathInfoRequest = new QueryPathInfoRequest();
        queryPathInfoRequest.setFileName(fileName);
        //queryPathInfoRequest.setLevelOfInterest(Constants.SMB_QUERY_FILE_BASIC_INFO);
        transactionRequest.setSubMessage(queryPathInfoRequest);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseQueryPathInfoResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet, 0);
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var queryPathInfoResponse = new QueryPathInfoResponse();
        queryPathInfoResponse.load(dataArray, dataOffset);
        return queryPathInfoResponse;
    };

    Protocol.prototype.createFindFirst2RequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var findFirst2Request = new FindFirst2Request();
        findFirst2Request.setDirectoryName(directoryName);
        //findFirst2Request.setSearchCount(3); // TODO
        transactionRequest.setSubMessage(findFirst2Request);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseFindFirst2ResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet, 0);
        var parameterArray = transactionResponse.getParameter();
        var parameterOffset = transactionResponse.getParameterOffset();
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var findFirst2Response = new FindFirst2Response();
        findFirst2Response.load(parameterArray, parameterOffset, dataArray, dataOffset);
        return findFirst2Response;
    };

    Protocol.prototype.createFindNext2RequestPacket = function(session, searchId, lastFileName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var findNext2Request = new FindNext2Request();
        findNext2Request.setSearchId(searchId);
        findNext2Request.setLastFileName(lastFileName);
        //findNext2Request.setSearchCount(3); // TODO
        transactionRequest.setSubMessage(findNext2Request);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseFindNext2ResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet, 0);
        var parameterArray = transactionResponse.getParameter();
        var parameterOffset = transactionResponse.getParameterOffset();
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var findNext2Response = new FindNext2Response();
        findNext2Response.load(parameterArray, parameterOffset, dataArray, dataOffset);
        return findNext2Response;
    };

    Protocol.prototype.createFindClose2RequestPacket = function(session, searchId) {
        var header = createHeader.call(this, Constants.SMB_COM_FIND_CLOSE2, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var findClose2Request = new FindClose2Request();
        findClose2Request.setSearchId(searchId);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, findClose2Request);
        return packet;
    };

    Protocol.prototype.createSeekRequestPacket = function(session, fid, offset) {
        var header = createHeader.call(this, Constants.SMB_COM_SEEK, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var seekRequest = new SeekRequest();
        seekRequest.setFId(fid);
        seekRequest.setOffset(offset);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, seekRequest);
        return packet;
    };

    Protocol.prototype.parseSeekResponsePacket = function(packet) {
        var seekResponse = new SeekResponse();
        seekResponse.load(packet);
        return seekResponse;
    };

    Protocol.prototype.createReadAndxRequestPacket = function(
        session, fid, offset, length) {
        var header = createHeader.call(this, Constants.SMB_COM_READ_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var readAndxRequest = new ReadAndxRequest();
        readAndxRequest.setFId(fid);
        readAndxRequest.setOffset(offset);
        readAndxRequest.setLength(length);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, readAndxRequest);
        return packet;
    };

    Protocol.prototype.parseReadAndxResponsePacket = function(packet) {
        var readAndxResponse = new ReadAndxResponse();
        readAndxResponse.load(packet);
        return readAndxResponse;
    };

    Protocol.prototype.createWriteAndxRequestPacket = function(session, fid, offset, data) {
        var header = createHeader.call(this, Constants.SMB_COM_WRITE_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var writeAndxRequest = new WriteAndxRequest();
        writeAndxRequest.setFId(fid);
        writeAndxRequest.setOffset(offset);
        writeAndxRequest.setData(data);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, writeAndxRequest);
        return packet;
    };

    Protocol.prototype.parseWriteAndxResponsePacket = function(packet) {
        var writeAndxResponse = new WriteAndxResponse();
        writeAndxResponse.load(packet);
        return writeAndxResponse;
    };

    Protocol.prototype.createCreateDirectoryRequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var createDirectoryRequest = new CreateDirectoryRequest();
        createDirectoryRequest.setDirectoryName(directoryName);
        transactionRequest.setSubMessage(createDirectoryRequest);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, transactionRequest);
        return packet;
    };

    Protocol.prototype.createDeleteRequestPacket = function(session, fileName) {
        var header = createHeader.call(this, Constants.SMB_COM_DELETE, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var deleteRequest = new DeleteRequest();
        deleteRequest.setFileName(fileName);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, deleteRequest);
        return packet;
    };

    Protocol.prototype.createDeleteDirectoryRequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_DELETE_DIRECTORY, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var deleteDirectoryRequest = new DeleteDirectoryRequest();
        deleteDirectoryRequest.setDirectoryName(directoryName);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, deleteDirectoryRequest);
        return packet;
    };

    Protocol.prototype.createRenameRequestPacket = function(session, source, target) {
        var header = createHeader.call(this, Constants.SMB_COM_RENAME, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var renameRequest = new RenameRequest();
        renameRequest.setOldFileName(source);
        renameRequest.setNewFileName(target);

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, renameRequest);
        return packet;
    };

    Protocol.prototype.createTreeDisconnectRequestPacket = function(session) {
        var header = createHeader.call(this, Constants.SMB_COM_TREE_DISCONNECT, {
            processId: session.getProcessId(),
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var emptyRequest = new EmptyRequest();

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, emptyRequest);
        return packet;
    };

    Protocol.prototype.createLogoffAndxRequestPacket = function(session) {
        var header = createHeader.call(this, Constants.SMB_COM_LOGOFF_ANDX, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var logoffAndxRequest = new LogoffAndxRequest();

        var packet = new Packet();
        packet.set(Constants.PROTOCOL_VERSION_SMB1, header, logoffAndxRequest);
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
        header.setFlag(
              Constants.SMB_FLAGS_CANONICAL_PATHNAMES
            | Constants.SMB_FLAGS_CASELESS_PATHNAMES);
        header.setFlag2(
              Constants.SMB_FLAGS2_UNICODE_STRINGS
            | Constants.SMB_FLAGS2_32BIT_STATUS
            | Constants.SMB_FLAGS2_EXTENDED_SECURITY
            | Constants.SMB_FLAGS2_EAS
            | Constants.SMB_FLAGS2_KNOWS_LONG_NAMES);
        header.setTreeId(treeId);
        header.setProcessId(processId);
        header.setUserId(userId);
        header.setMultiplexId(this.sequenceNumber_);

        this.sequenceNumber_++;

        return header;
    };

    // Export

    Smb1.Protocol = Protocol;

})(SmbClient.Smb1,
   SmbClient.Constants,
   SmbClient.Packet,
   SmbClient.Smb1.Models.Header,
   SmbClient.Types,
   SmbClient.Smb1.Models.EchoRequest,
   SmbClient.Smb1.Models.NegotiateProtocolRequest,
   SmbClient.Smb1.Models.NegotiateProtocolResponse,
   SmbClient.Smb1.Models.SessionSetupAndxRequest,
   SmbClient.Auth.Type1Message,
   SmbClient.Smb1.Models.SessionSetupAndxResponse,
   SmbClient.Auth.NtlmV2Hash,
   SmbClient.Auth.LmV2Response,
   SmbClient.Debug,
   SmbClient.Auth.NtlmV2Response,
   SmbClient.Auth.LmHash,
   SmbClient.Auth.LmResponse,
   SmbClient.Auth.NtlmHash,
   SmbClient.Auth.Type3Message,
   SmbClient.Auth.TypeMessageUtils,
   SmbClient.Smb1.Models.TreeConnectAndxRequest,
   SmbClient.Smb1.Models.TreeConnectAndxResponse,
   SmbClient.Smb1.Models.NtCreateAndxRequest,
   SmbClient.Smb1.Models.NtCreateAndxResponse,
   SmbClient.Smb1.Models.TransactionRequest,
   SmbClient.DceRpc.DceRpcBind,
   SmbClient.Smb1.Models.TransactionResponse,
   SmbClient.DceRpc.DceRpcBindAck,
   SmbClient.DceRpc.DceRpcNetShareEnumAllRequest,
   SmbClient.DceRpc.DceRpcNetShareEnumAllResponse,
   SmbClient.Smb1.Models.CloseRequest,
   SmbClient.Smb1.Models.QueryPathInfoRequest,
   SmbClient.Smb1.Models.QueryPathInfoResponse,
   SmbClient.Smb1.Models.FindFirst2Request,
   SmbClient.Smb1.Models.FindFirst2Response,
   SmbClient.Smb1.Models.FindNext2Request,
   SmbClient.Smb1.Models.FindNext2Response,
   SmbClient.Smb1.Models.FindClose2Request,
   SmbClient.Smb1.Models.SeekRequest,
   SmbClient.Smb1.Models.SeekResponse,
   SmbClient.Smb1.Models.ReadAndxRequest,
   SmbClient.Smb1.Models.ReadAndxResponse,
   SmbClient.Smb1.Models.WriteAndxRequest,
   SmbClient.Smb1.Models.WriteAndxResponse,
   SmbClient.Smb1.Models.CreateDirectoryRequest,
   SmbClient.Smb1.Models.DeleteRequest,
   SmbClient.Smb1.Models.DeleteDirectoryRequest,
   SmbClient.Smb1.Models.RenameRequest,
   SmbClient.Smb1.Models.EmptyRequest,
   SmbClient.Smb1.Models.LogoffAndxRequest);
