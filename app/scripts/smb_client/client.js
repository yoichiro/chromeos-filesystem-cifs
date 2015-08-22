(function(Communication,
          ChromeSocket2,
          Session,
          Constants,
          Debug,
          Smb1ClientImpl,
          Smb2ClientImpl) {

    "use strict";

    // Constructor

    var Client = function() {
        this.comm_ = new Communication();
        this.comm_.setSocketImpl(new ChromeSocket2());

        this.smb1ClientImpl_ = new Smb1ClientImpl(this);
        this.smb2ClientImpl_ = new Smb2ClientImpl(this);

        this.session_ = null;
    };

    // Static values

    Client.process_id_ = 0;

    // Public functions
    
    Client.prototype.getCommunication = function() {
        return this.comm_;
    };
    
    Client.prototype.getSession = function() {
        return this.session_;
    };

    Client.prototype.login = function(serverName, port, userName, password, domainName, onSuccess, onError) {
        Debug.trace("Client#login");

        this.session_ = new Session();
        Client.process_id_ += 1;
        this.session_.setProcessId(Client.process_id_);

        var errorHandler = function(error) {
            onError(error);
        }.bind(this);

        if (!domainName) {
            Debug.info("Domain name not specified. '?' will be applied.");
            domainName = "?";
        }

        connect.call(this, serverName, port, function() {
            // NegotiateProtocol request is sent with SMB1 anytime.
            this.smb1ClientImpl_.negotiateProtocol(function(packet) {
                handleNegotiateProtocolResponse.call(
                    this, userName, password, domainName, packet, onSuccess, errorHandler);
            }.bind(this), errorHandler);
        }.bind(this), errorHandler);
    };
    
    Client.prototype.logout = function(onSuccess, onError) {
        Debug.trace("Client#logout");
        
        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.logout(function() {
                disconnect.call(this, function() {
                    onSuccess();
                }.bind(this), onError);
            }.bind(this), onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    /*jslint bitwise: true */
    Client.prototype.getSharedResourceList = function(onSuccess, onError) {
        Debug.trace("Client#getSharedResourceList");
        
        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.getSharedResourceList(onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.connectSharedResource = function(path, onSuccess, onError) {
        Debug.trace("Client#connectSharedResource");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.connectSharedResource(path, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.getMetadata = function(fileName, onSuccess, onError) {
        Debug.trace("Client#getMetadata");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.getMetadata(fileName, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.readDirectory = function(directoryName, onSuccess, onError) {
        Debug.trace("Client#readDirectory: " + directoryName);

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.readDirectory(directoryName, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.readFile = function(fileName, offset, length, onSuccess, onError) {
        Debug.trace("Client#readFile");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.readFile(fileName, offset, length, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.createFile = function(fileName, onSuccess, onError) {
        Debug.trace("Client#createFile");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.createFile(fileName, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.truncate = function(fileName, length, onSuccess, onError) {
        Debug.trace("Client#truncate");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.truncate(fileName, length, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    // array: Uint8Array
    Client.prototype.writeFile = function(fileName, offset, array, onSuccess, onError) {
        Debug.trace("Client#writeFile");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.writeFile(fileName, offset, array, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.createDirectory = function(directoryName, onSuccess, onError) {
        Debug.trace("Client#createDirectory");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.createDirectory(directoryName, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.deleteEntry = function(fileName, onSuccess, onError) {
        Debug.trace("Client#deleteEntry");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.deleteEntry(fileName, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.move = function(source, target, onSuccess, onError) {
        Debug.trace("Client#move");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.move(source, target, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    Client.prototype.copy = function(source, target, onSuccess, onError) {
        Debug.trace("Client#copy");

        if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.smb1ClientImpl_.copy(source, target, onSuccess, onError);
        } else if (this.session_.getProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            // TODO Delegate this process to Smb2ClientImpl.
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    // Private functions

    var connect = function(serverName, port, onSuccess, onError) {
        this.comm_.connect(serverName, Number(port), function() {
            this.session_.setServerName(serverName);
            onSuccess();
        }.bind(this), function(reason) {
            onError(reason);
        }.bind(this));
    };

    var disconnect = function(onSuccess) {
        this.comm_.disconnect(function() {
            onSuccess();
        }.bind(this));
    };

    var handleNegotiateProtocolResponse = function(userName, password, domainName, packet, onSuccess, onError) {
        if (packet.getSmbProtocolVersion() === Constants.PROTOCOL_VERSION_SMB1) {
            this.session_.setProtocolVersion(Constants.PROTOCOL_VERSION_SMB1);
            this.smb1ClientImpl_.handleNegotiateProtocolResponse(
                    packet, function(negotiateProtocolResponseHeader, negotiateProtocolResponse) {
                Debug.log(negotiateProtocolResponseHeader);
                Debug.log(negotiateProtocolResponse);
                this.smb1ClientImpl_.sessionSetup(
                    negotiateProtocolResponse, userName, password, domainName,
                    function() {
                        onSuccess();
                    }.bind(this), onError);
            }.bind(this), onError);
        } else if (packet.getSmbProtocolVersion() === Constants.PROTOCOL_VERSION_SMB2) {
            this.session_.setProtocolVersion(Constants.PROTOCOL_VERSION_SMB2);
            this.smb2ClientImpl_.handleNegotiateResponse(
                    packet, function(negotiateResponseHeader, negotiateResponse) {
                Debug.log(negotiateResponseHeader);
                Debug.log(negotiateResponse);
                this.smb2ClientImpl_.sessionSetup(
                    negotiateResponse, userName, password, domainName,
                    function() {
                        onSuccess();
                    }.bind(this), onError);
            }.bind(this), onError);
        } else {
            throw new Error("Unknown protocol version");
        }
    };

    // Export

    SmbClient.Client = Client;

})(SmbClient.Communication,
   SmbClient.ChromeSocket2,
   SmbClient.Session,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb1.ClientImpl,
   SmbClient.Smb2.ClientImpl);
