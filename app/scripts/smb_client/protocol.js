(function(Constants, Packet, Header, Types, EchoRequest, NegotiateProtocolRequest, NegotiateProtocolResponse, SessionSetupAndxRequest, Type1Message, SessionSetupAndxResponse, NtlmV2Hash, LmV2Response, Debug, NtlmV2Response, Type3Message, TreeConnectAndxResponse, NtCreateAndxRequest, NtCreateAndxResponse, TransactionRequest, DceRpcBind, TransactionResponse, DceRpcBindAck, DceRpcNetShareEnumAllRequest, DceRpcNetShareEnumAllResponse, CloseRequest, QueryPathInfoRequest, QueryPathInfoResponse, FindFirst2Request, FindFirst2Response, FindNext2Request, FindNext2Response, FindClose2Request, SeekRequest, SeekResponse, ReadAndxRequest, ReadAndxResponse, WriteAndxRequest, WriteAndxResponse, CreateDirectoryRequest, DeleteRequest, DeleteDirectoryRequest, RenameRequest) {

    // Constructor

    var Protocol = function() {
        this.types_ = new Types();

        this.sequenceNumber_ = 1;
    };

    // Public functions

    // dialects: array of string
    Protocol.prototype.createNegotiateProtocolRequestPacket = function(session, dialects) {
        var header = createHeader.call(this, Constants.SMB_COM_NEGOTIATE, {});
        var negotiateProtocolRequest = new NegotiateProtocolRequest();
        negotiateProtocolRequest.setDialects(dialects);
        var packet = new Packet();
        packet.set(header, negotiateProtocolRequest);
        return packet;
    };

    Protocol.prototype.parseNegotiateProtocolResponse = function(packet) {
        var negotiateProtocolResponse = new NegotiateProtocolResponse();
        negotiateProtocolResponse.load(packet);
        return negotiateProtocolResponse;
    };

    Protocol.prototype.createSessionSetupRequestType1Packet = function(session, negotiateProtocolResponse) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {});

        var type1Message = new Type1Message();
        type1Message.setFlag(
              Constants.NTLMSSP_NEGOTIATE_UNICODE
            | Constants.NTLMSSP_REQUEST_TARGET
            | Constants.NTLMSSP_NEGOTIATE_NTLM
            | Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_NTLM2
            | Constants.NTLMSSP_NEGOTIATE_128
        );
        type1Message.setSuppliedDomain("?");
        type1Message.setSuppliedWorkstation("FSP_CIFS");

        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, type1Message);

        var packet = new Packet();
        packet.set(header, sessionSetupAndxRequest);
        return packet;
    };

    Protocol.prototype.parseSessionSetupResponse = function(packet) {
        var sessionSetupAndxResponse = new SessionSetupAndxResponse();
        sessionSetupAndxResponse.load(packet);
        return sessionSetupAndxResponse;
    };

    Protocol.prototype.createSessionSetupRequestType3Packet = function(session, username, password, negotiateProtocolResponse, type2Message) {
        var header = createHeader.call(this, Constants.SMB_COM_SESSION_SETUP_ANDX, {
            userId: session.getUserId()
        });

        var serverChallenge = type2Message.getChallenge();
        //Debug.outputUint8Array(serverChallenge);

        var lmV2HashObj = new NtlmV2Hash();
        var lmV2Hash = lmV2HashObj.create(username, password, "?");
        var lmV2ResponseObj = new LmV2Response();
        var lmV2Response = lmV2ResponseObj.create(lmV2Hash, serverChallenge);

        var ntlmV2HashObj = new NtlmV2Hash();
        var ntlmV2Hash = ntlmV2HashObj.create(username, password, "?");
        var ntlmV2ResponseObj = new NtlmV2Response();
        var targetInformation = type2Message.getTargetInformation();
        //Debug.outputUint8Array(targetInformation);
        var ntlmV2Response = ntlmV2ResponseObj.create(ntlmV2Hash, serverChallenge, targetInformation);
        //Debug.outputArrayBuffer(ntlmV2Response);

        var type3Message = new Type3Message();
        type3Message.setLmResponse(lmV2Response);
        type3Message.setNtlmResponse(ntlmV2Response);
        type3Message.setDomainName("?");
        type3Message.setUsername(username);
        type3Message.setWorkstationName("FSP_CIFS");
        type3Message.setSessionKey(null);
        type3Message.setFlag(
              Constants.NTLMSSP_NEGOTIATE_UNICODE
            | Constants.NTLMSSP_NEGOTIATE_NTLM
        );
        type3Message.load(type2Message);

        var sessionSetupAndxRequest = new SessionSetupAndxRequest();
        sessionSetupAndxRequest.load(negotiateProtocolResponse, type3Message);

        var packet = new Packet();
        packet.set(header, sessionSetupAndxRequest);
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
        packet.set(header, echoRequest);
        return packet;
    };

    Protocol.prototype.createTreeConnectAndxRequestPacket = function(session, path, service) {
        var header = createHeader.call(this, Constants.SMB_COM_TREE_CONNECT_ANDX, {
            userId: session.getUserId()
        });

        var treeConnectAndxRequest = new SmbClient.TreeConnectAndxRequest();
        treeConnectAndxRequest.setPath("\\\\" + session.getServerName() + "\\" + path);
        treeConnectAndxRequest.setService(service);

        var packet = new Packet();
        packet.set(header, treeConnectAndxRequest);
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
        packet.set(header, ntCreateAndxRequest);
        return packet;
    };

    Protocol.prototype.parseNtCreateAndxResponse = function(packet) {
        var ntCreateAndxResponse = new NtCreateAndxResponse();
        ntCreateAndxResponse.load(packet);
        return ntCreateAndxResponse;
    };

    Protocol.prototype.createDceRpcBindRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        transactionRequest.setTransactionName("\\PIPE\\");
        var dceRpcBind = new DceRpcBind();
        dceRpcBind.setFId(fid);
        transactionRequest.setSubMessage(dceRpcBind);

        var packet = new Packet();
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseDceRpcBindAckPacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet);
        var dataArray = transactionResponse.getData();
        var dceRpcBindAck = new DceRpcBindAck();
        dceRpcBindAck.load(dataArray);
        return dceRpcBindAck;
    };

    Protocol.prototype.createDceRpcNetShareEnumAllRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION, {
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
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseDceRpcNetShareEnumAllResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet);
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var dceRpcNetShareEnumAllResponse = new DceRpcNetShareEnumAllResponse();
        dceRpcNetShareEnumAllResponse.load(dataArray, dataOffset);
        return dceRpcNetShareEnumAllResponse;
    };

    Protocol.prototype.createCloseRequestPacket = function(session, fid) {
        var header = createHeader.call(this, Constants.SMB_COM_CLOSE, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var closeRequest = new CloseRequest();
        closeRequest.setFId(fid);

        var packet = new Packet();
        packet.set(header, closeRequest);
        return packet;
    };

    Protocol.prototype.createQueryPathInfoRequestPacket = function(session, fileName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var queryPathInfoRequest = new QueryPathInfoRequest();
        queryPathInfoRequest.setFileName(fileName);
        //queryPathInfoRequest.setLevelOfInterest(Constants.SMB_QUERY_FILE_BASIC_INFO);
        transactionRequest.setSubMessage(queryPathInfoRequest);

        var packet = new Packet();
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseQueryPathInfoResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet);
        var dataArray = transactionResponse.getData();
        var dataOffset = transactionResponse.getDataOffset();
        var queryPathInfoResponse = new QueryPathInfoResponse();
        queryPathInfoResponse.load(dataArray, dataOffset);
        return queryPathInfoResponse;
    };

    Protocol.prototype.createFindFirst2RequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var findFirst2Request = new FindFirst2Request();
        findFirst2Request.setDirectoryName(directoryName);
        //findFirst2Request.setSearchCount(3); // TODO
        transactionRequest.setSubMessage(findFirst2Request);

        var packet = new Packet();
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseFindFirst2ResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet);
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
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.parseFindNext2ResponsePacket = function(packet) {
        var transactionResponse = new TransactionResponse();
        transactionResponse.load(packet);
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
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var findClose2Request = new FindClose2Request();
        findClose2Request.setSearchId(searchId);

        var packet = new Packet();
        packet.set(header, findClose2Request);
        return packet;
    };

    Protocol.prototype.createSeekRequestPacket = function(session, fid, offset) {
        var header = createHeader.call(this, Constants.SMB_COM_SEEK, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var seekRequest = new SeekRequest();
        seekRequest.setFId(fid);
        seekRequest.setOffset(offset);

        var packet = new Packet();
        packet.set(header, seekRequest);
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
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var readAndxRequest = new ReadAndxRequest();
        readAndxRequest.setFId(fid);
        readAndxRequest.setOffset(offset);
        readAndxRequest.setLength(length);

        var packet = new Packet();
        packet.set(header, readAndxRequest);
        return packet;
    };

    Protocol.prototype.parseReadAndxResponsePacket = function(packet) {
        var readAndxResponse = new ReadAndxResponse();
        readAndxResponse.load(packet);
        return readAndxResponse;
    };

    Protocol.prototype.createWriteAndxRequestPacket = function(session, fid, offset, data) {
        var header = createHeader.call(this, Constants.SMB_COM_WRITE_ANDX, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var writeAndxRequest = new WriteAndxRequest();
        writeAndxRequest.setFId(fid);
        writeAndxRequest.setOffset(offset);
        writeAndxRequest.setData(data);

        var packet = new Packet();
        packet.set(header, writeAndxRequest);
        return packet;
    };

    Protocol.prototype.parseWriteAndxResponsePacket = function(packet) {
        var writeAndxResponse = new WriteAndxResponse();
        writeAndxResponse.load(packet);
        return writeAndxResponse;
    };

    Protocol.prototype.createCreateDirectoryRequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_TRANSACTION2, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var transactionRequest = new TransactionRequest();
        var createDirectoryRequest = new CreateDirectoryRequest();
        createDirectoryRequest.setDirectoryName(directoryName);
        transactionRequest.setSubMessage(createDirectoryRequest);

        var packet = new Packet();
        packet.set(header, transactionRequest);
        return packet;
    };

    Protocol.prototype.createDeleteRequestPacket = function(session, fileName) {
        var header = createHeader.call(this, Constants.SMB_COM_DELETE, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var deleteRequest = new DeleteRequest();
        deleteRequest.setFileName(fileName);

        var packet = new Packet();
        packet.set(header, deleteRequest);
        return packet;
    };

    Protocol.prototype.createDeleteDirectoryRequestPacket = function(session, directoryName) {
        var header = createHeader.call(this, Constants.SMB_COM_DELETE_DIRECTORY, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var deleteDirectoryRequest = new DeleteDirectoryRequest();
        deleteDirectoryRequest.setDirectoryName(directoryName);

        var packet = new Packet();
        packet.set(header, deleteDirectoryRequest);
        return packet;
    };

    Protocol.prototype.createRenameRequestPacket = function(session, source, target) {
        var header = createHeader.call(this, Constants.SMB_COM_RENAME, {
            userId: session.getUserId(),
            treeId: session.getTreeId()
        });

        var renameRequest = new RenameRequest();
        renameRequest.setOldFileName(source);
        renameRequest.setNewFileName(target);

        var packet = new Packet();
        packet.set(header, renameRequest);
        return packet;
    };

    // Private functions

    // options: userId
    var createHeader = function(command, options) {
        var userId = options.userId || 0;
        var treeId = options.treeId || 0;

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
        header.setProcessId(0x0001);
        header.setUserId(userId);
        header.setMultiplexId(this.sequenceNumber_);

        this.sequenceNumber_++;

        return header;
    };

    // Export

    SmbClient.Protocol = Protocol;

})(SmbClient.Constants,
   SmbClient.Packet,
   SmbClient.Header,
   SmbClient.Types,
   SmbClient.EchoRequest,
   SmbClient.NegotiateProtocolRequest,
   SmbClient.NegotiateProtocolResponse,
   SmbClient.SessionSetupAndxRequest,
   SmbClient.Type1Message,
   SmbClient.SessionSetupAndxResponse,
   SmbClient.NtlmV2Hash,
   SmbClient.LmV2Response,
   SmbClient.Debug,
   SmbClient.NtlmV2Response,
   SmbClient.Type3Message,
   SmbClient.TreeConnectAndxResponse,
   SmbClient.NtCreateAndxRequest,
   SmbClient.NtCreateAndxResponse,
   SmbClient.TransactionRequest,
   SmbClient.DceRpcBind,
   SmbClient.TransactionResponse,
   SmbClient.DceRpcBindAck,
   SmbClient.DceRpcNetShareEnumAllRequest,
   SmbClient.DceRpcNetShareEnumAllResponse,
   SmbClient.CloseRequest,
   SmbClient.QueryPathInfoRequest,
   SmbClient.QueryPathInfoResponse,
   SmbClient.FindFirst2Request,
   SmbClient.FindFirst2Response,
   SmbClient.FindNext2Request,
   SmbClient.FindNext2Response,
   SmbClient.FindClose2Request,
   SmbClient.SeekRequest,
   SmbClient.SeekResponse,
   SmbClient.ReadAndxRequest,
   SmbClient.ReadAndxResponse,
   SmbClient.WriteAndxRequest,
   SmbClient.WriteAndxResponse,
   SmbClient.CreateDirectoryRequest,
   SmbClient.DeleteRequest,
   SmbClient.DeleteDirectoryRequest,
   SmbClient.RenameRequest);
