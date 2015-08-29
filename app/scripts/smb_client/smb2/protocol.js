(function(Smb2,
          Constants,
          Packet,
          Header,
          Types,
          NegotiateResponse,
          Type1Message,
          SessionSetupRequest,
          SessionSetupResponse,
          Type3Message,
          NtlmV2Hash,
          LmV2Response,
          NtlmV2Response,
          LmHash,
          LmResponse,
          NtlmHash,
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
          EmptyRequest) {

    "use strict";

    // Constructor

    var Protocol = function() {
        this.types_ = new Types();

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

        var sessionSetupRequest = new SessionSetupRequest();
        sessionSetupRequest.load(negotiateResponse, {
            ntlmMessage: type1Message
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
    
    Protocol.prototype.createSessionSetupRequestType3Packet = function(session, username, password, domainName, negotiateResponse, type2Message) {
        var header = createHeader.call(this, Constants.SMB2_SESSION_SETUP, {
            processId: session.getProcessId(),
            userId: session.getUserId()
        });

        var serverChallenge = type2Message.getChallenge();

        var type3Message = new Type3Message();

        if (type2Message.isFlagOf(Constants.NTLMSSP_NEGOTIATE_NTLM2)) { // LMv2 and NTLMv2
            var lmV2HashObj = new NtlmV2Hash();
            var lmV2Hash = lmV2HashObj.create(username, password, domainName);
            var lmV2ResponseObj = new LmV2Response();
            var lmV2Response = lmV2ResponseObj.create(lmV2Hash, serverChallenge);
    
            var ntlmV2HashObj = new NtlmV2Hash();
            var ntlmV2Hash = ntlmV2HashObj.create(username, password, domainName);
            var ntlmV2ResponseObj = new NtlmV2Response();
            var targetInformation = type2Message.getTargetInformation();
            var ntlmV2Response = ntlmV2ResponseObj.create(ntlmV2Hash, serverChallenge, targetInformation);
    
            type3Message.setLmResponse(lmV2Response);
            type3Message.setNtlmResponse(ntlmV2Response);

            type3Message.setFlag(
                  Constants.NTLMSSP_NEGOTIATE_UNICODE
                | Constants.NTLMSSP_NEGOTIATE_NTLM2
            );
        } else { // LMv1 and NTLMv1
            var lmHashObj = new LmHash();
            var lmHash = lmHashObj.create(password);
            var lmResponseObj = new LmResponse();
            var lmResponse = lmResponseObj.create(lmHash, serverChallenge);

            var ntlmHashObj = new NtlmHash();
            var ntlmHash = ntlmHashObj.create(password);
            var ntlmResponseObj = new LmResponse();
            var ntlmResponse = ntlmResponseObj.create(ntlmHash, serverChallenge);

            type3Message.setLmResponse(lmResponse);
            type3Message.setNtlmResponse(ntlmResponse);

            type3Message.setFlag(
                  Constants.NTLMSSP_NEGOTIATE_UNICODE
                | Constants.NTLMSSP_NEGOTIATE_NTLM
            );
        }

        type3Message.setDomainName(domainName);
        type3Message.setUsername(username);
        type3Message.setWorkstationName("FSP_CIFS");
        type3Message.setSessionKey(null);
        type3Message.load(type2Message);

        var sessionSetupRequest = new SessionSetupRequest();
        sessionSetupRequest.load(negotiateResponse, {
            ntlmMessage: type3Message
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
   SmbClient.Auth.Type3Message,
   SmbClient.Auth.NtlmV2Hash,
   SmbClient.Auth.LmV2Response,
   SmbClient.Auth.NtlmV2Response,
   SmbClient.Auth.LmHash,
   SmbClient.Auth.LmResponse,
   SmbClient.Auth.NtlmHash,
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
   SmbClient.Smb2.Models.EmptyRequest);
