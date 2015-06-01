(function() {

    // Constructor

    var ChromeSocket2 = function() {
        this.socketId = null;
        this.initialize();
        this.callbacks = [];
        this.buffer = new ArrayBuffer(0);
        _resetTls.call(this);
        this.host = null;
        this.ca = null;
        this.checkCommonName = false;
    };

    // Private methods

    var _resetTls = function() {
        this.tlsRequiredByteLength = 0;
        this.tlsBuffer = "";
        this.tls = {
            open: false
        };
        this.tlsSendCallback = null;
        this.tlsSendErrorCallback = null;
    };

    var _appendReceivedData = function(received) {
        var newSize = this.buffer.byteLength + received.byteLength;
        var newBuffer = new ArrayBuffer(newSize);
        var newBufferView = new Uint8Array(newBuffer, 0, newSize);
        newBufferView.set(new Uint8Array(this.buffer, 0, this.buffer.byteLength), 0);
        newBufferView.set(new Uint8Array(received, 0, received.byteLength),
                          this.buffer.byteLength);
        this.buffer = newBuffer;
        this.fetch();
    };

    var _string2ArrayBuffer = function(string, callback) {
        var buf = new ArrayBuffer(string.length);
        var bufView = new Uint8Array(buf);
        for (var i=0; i < string.length; i++) {
            bufView[i] = string.charCodeAt(i);
        }
        callback(buf);
    };

    var _arrayBuffer2String = function(buf, callback) {
        var bufView = new Uint8Array(buf);
        var chunkSize = 65536;
        var result = '';
        for (var i = 0; i < bufView.length; i += chunkSize) {
            result += String.fromCharCode.apply(
                null, bufView.subarray(i, Math.min(i + chunkSize, bufView.length)));
        }
        callback(result);
    };

    var _receiveTlsData = function(received) {
        _arrayBuffer2String.call(this, received, function(data) {
            this.tlsBuffer += data;
            if (this.tlsBuffer.length >= this.tlsRequiredByteLength) {
                this.tlsRequiredByteLength = this.tls.process(this.tlsBuffer);
                this.tlsBuffer = "";
            }
        }.bind(this));
    };

    var _doSend = function(buffer, callback, errorCallback) {
        chrome.sockets.tcp.send(this.socketId, buffer, function(sendInfo) {
            var resultCode = sendInfo.resultCode;
            if (resultCode === 0) {
                callback(sendInfo);
            } else {
                console.log("Error: writeInfo.resultCode=" + resultCode);
                errorCallback("Sending data failed: " + resultCode);
            }
        }.bind(this));
    };

    var _outputArrayBuffer = function(buffer) {
        var array = new Uint8Array(buffer);
        var out = "";
        for (var i = 0; i < array.length; i++) {
            out += String.fromCharCode(array[i]);
        }
        console.log(out);
    };

    // Public methods

    ChromeSocket2.prototype.initialize = function() {
        chrome.sockets.tcp.onReceive.addListener(function(info) {
            if (this.socketId === info.socketId) {
                this.onReceive(info);
            }
        }.bind(this));
        chrome.sockets.tcp.onReceiveError.addListener(function(info) {
            if (this.socketId === info.socketId) {
                this.onReceiveError(info);
            }
        }.bind(this));
    };

    ChromeSocket2.prototype.onReceive = function(info) {
        var received = info.data;
        if (this.tls.open) {
            _receiveTlsData.call(this, received);
        } else {
            _appendReceivedData.call(this, received);
        }
    };

    ChromeSocket2.prototype.onReceiveError = function(info) {
        this.raiseError(info);
    };

    ChromeSocket2.prototype.raiseError = function(info) {
        if (this.callbacks.length > 0) {
            var data = this.callbacks[0];
            data.fatalCallback("Network error occurred: " + info.resultCode);
            // Delete callback info
            this.callbacks = this.callbacks.slice(1);
        }
    };

    ChromeSocket2.prototype.fetch = function() {
        if (this.callbacks.length > 0) {
            var data = this.callbacks[0];
            var resultBuffer, resultBufferArray, bufferArray, result;
            if (data.length > 0) {
                if (this.buffer.byteLength >= data.length) {
                    // Fetch result buffer
                    resultBuffer = new ArrayBuffer(data.length);
                    resultBufferArray = new Uint8Array(resultBuffer, 0, resultBuffer.byteLength);
                    bufferArray = new Uint8Array(this.buffer, 0, this.buffer.byteLength);
                    resultBufferArray.set(bufferArray.subarray(0, data.length));
                    // Delete read bytes
                    var newBuffer = new ArrayBuffer(this.buffer.byteLength - data.length);
                    var newArray = new Uint8Array(newBuffer, 0, newBuffer.byteLength);

                    newArray.set(bufferArray.subarray(data.length, bufferArray.byteLength), 0);
                    this.buffer = newBuffer;
                    // Delete callback info
                    this.callbacks = this.callbacks.slice(1);
                    // Make result
                    result = {
                        resultCode: 0,
                        data: resultBuffer
                    };
                    data.callback(result);
                    // Recursible
                    this.fetch();
                }
            } else if (data.length === -1) {
                // Fetch result buffer
                resultBuffer = new ArrayBuffer(this.buffer.byteLength);
                resultBufferArray = new Uint8Array(resultBuffer, 0, resultBuffer.byteLength);
                bufferArray = new Uint8Array(this.buffer, 0, this.buffer.byteLength);
                resultBufferArray.set(bufferArray.subarray(0, this.buffer.byteLength));
                // Delete read bytes
                this.buffer = new ArrayBuffer(0);
                // Delete callback info
                this.callbacks = this.callbacks.slice(1);
                // Make result
                result = {
                    resultCode: 0,
                    data: resultBuffer
                };
                data.callback(result);
                // Recursible
                this.fetch();
            } else {
                console.log("Invalid data.length: " + data.length);
            }
        }
    };

    ChromeSocket2.prototype.connect = function(host, port, callback) {
        var id = null;
        chrome.sockets.tcp.create({
            bufferSize: 0xFFFFFF
        }, function(createInfo) {
            id = createInfo.socketId;
            chrome.sockets.tcp.connect(
                id, host, port, function(result) {
                    if (result >= 0) {
                        this.socketId = id;
                        this.host = host;
                    } else {
                        this.socketId = null;
                        this.host = null;
                    }
                    this.ca = null;
                    callback(result);
                }.bind(this));
        }.bind(this));
    };

    ChromeSocket2.prototype.isConnected = function() {
        return this.socketId !== null;
    };

    ChromeSocket2.prototype.disconnect = function(callback) {
        if (this.socketId) {
            if (this.tls.open) {
                this.tls.close();
            }
            chrome.sockets.tcp.disconnect(this.socketId);
            chrome.sockets.tcp.close(this.socketId);
        }
        this.socketId = null;
        this.host = null;
        this.ca = null;
        this.callbacks = [];
        this.buffer = new ArrayBuffer(0);
        _resetTls.call(this);
        if (callback) {
            callback();
        }
    };

    ChromeSocket2.prototype.write = function(packet, callback, errorCallback) {
        if (this.tls.open) {
            _arrayBuffer2String.call(this, packet.createArrayBuffer(), function(data) {
                this.tlsSendCallback = callback;
                this.tlsSendErrorCallback = errorCallback;
                this.tls.prepare(data);
            }.bind(this));
        } else {
            _doSend.call(this, packet.createArrayBuffer(), callback, errorCallback);
        }
    };

    ChromeSocket2.prototype.read = function(length, callback, fatalCallback) {
        this.callbacks.push({
            length: length,
            callback: callback,
            fatalCallback: fatalCallback
        });
    };

    ChromeSocket2.prototype.establishTls = function(ca, checkCN, callback, fatalCallback) {
        this.ca = ca;
        this.checkCommonName = checkCN;
        _initializeTls.call(this, callback, fatalCallback);
        chrome.sockets.tcp.setPaused(this.socketId, true, function() {
            this.tls.handshake();
            chrome.sockets.tcp.setPaused(this.socketId, false);
        }.bind(this));
    };

    var _verify = function(c, verified, depth, certs) {
        if (!(certs && certs[0])) {
            return false;
        }
        if (!_verifyCertificate.call(this, certs[0], this.host)) {
            return false;
        }
        if (!this.ca) {
            return true;
        }
        var caObj = forge.pki.certificateFromPem(this.ca);
        if (!_verifyCertificate.call(this, caObj, this.host)) {
            return false;
        }
        if (caObj.verify(certs[0])) {
            return true;
        }
        var fingerprint1 = forge.pki.getPublicKeyFingerprint(caObj.publicKey, {
            encoding: 'hex'
        });
        var fingerprint2 = forge.pki.getPublicKeyFingerprint(certs[0].publicKey, {
            encoding: 'hex'
        });
        if (fingerprint1 === fingerprint2) {
            return true;
        }
        return false;
    };

    var _verifyCertificate = function(cert, host) {
        var cn = cert.subject.getField("CN");
        if (cn && cn.value) {
            if (_matchHost.call(this, cn, host)) {
                return true;
            }
        }
        var subjectAltName = cert.getExtension({
            name: "subjectAltName"
        });
        if (!(subjectAltName && subjectAltName.altNames)){ 
            return false;
        }
        var altNames = subjectAltName.altNames;
        for (var i = altNames.length - 1; i >= 0; i--) {
            if (altNames[i] && altNames[i].value) {
                if (_matchHost.call(this, altNames[i], host)) {
                    return true;
                }
            }
        }
        return false;
    };

    var _matchHost = function(pattern, host) {
        if (this.checkCommonName) {
            var regexp = new RegExp(pattern.value.replace(/\./g, "\\.").replace(/\*/g, ".*"), "i");
            return regexp.test(host);
        } else {
            return true;
        }
    };

    var _initializeTls = function(callback, fatalCallback) {
        this.tls = forge.tls.createConnection({
            server: false,
            sessionId: null,
            caStore: [],
            sessionCache: null,
            cipherSuites: [
                forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
                forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
            virtualHost: null,
            verify: function(c, verified, depth, certs) {
                return _verify.call(this, c, verified, depth, certs);
            }.bind(this),
            getCertificate: null,
            getPrivateKey: null,
            getSignature: null,
            deflate: null,
            inflate: null,
            connected: function(c) {
                callback();
            },
            tlsDataReady: function(c) {
                var bytes = c.tlsData.getBytes();
                if (bytes.length > 0) {
                    _string2ArrayBuffer.call(this, bytes, function(data) {
                        _doSend.call(this, data, function(sendInfo) {
                            var targetCallback = this.tlsSendCallback;
                            this.tlsSendCallback = null;
                            if (targetCallback) {
                                targetCallback(sendInfo);
                            }
                        }.bind(this), function(reason) {
                            var targetCallback = this.tlsSendErrorCallback;
                            this.tlsSendErrorCallback = null;
                            if (targetCallback) {
                                targetCallback(reason);
                            }
                        }.bind(this));
                    }.bind(this));
                }
            }.bind(this),
            dataReady: function(c) {
                _string2ArrayBuffer.call(this, c.data.getBytes(), function(received) {
                    _appendReceivedData.call(this, received);
                }.bind(this));
            }.bind(this),
            closed: function(c) {
                // N/A
            }.bind(this),
            error: function(c, e) {
                console.log(e);
                fatalCallback(e.message);
            }.bind(this)
        });
    };

    // Export

    SmbClient.ChromeSocket2 = ChromeSocket2;

})();
