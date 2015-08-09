(function(Packet, Types, Debug, Constants) {
    "use strict";

    // Constructor

    var Communication = function() {
        this.types_ = new Types();
        this.socketImpl = null;
    };

    // Public Methods

    Communication.prototype.setSocketImpl = function(impl) {
        this.socketImpl = impl;
    };

    Communication.prototype.connect = function(host, port, callback, errorCallback) {
        Debug.log("connect");
        this.socketImpl.connect(host, port, callback, function(reason) {
            errorCallback(reason);
        }.bind(this));
    };

    Communication.prototype.disconnect = function(callback) {
        Debug.log("disconnect");
        this.socketImpl.disconnect(callback);
    };

    Communication.prototype.isConnected = function() {
        return this.socketImpl.isConnected();
    };

    Communication.prototype.readPacket = function(callback, fatalCallback) {
        Debug.trace("readPacket");
        if (this.isConnected()) {
            _readPacketSize.call(this, 4, function(dataLength) {
                Debug.trace("readPacket: " + dataLength);
                _read.call(this, dataLength, function(readInfo) {
                    var packet = new Packet(readInfo.data);
                    callback(packet);
                }.bind(this), fatalCallback);
            }.bind(this), fatalCallback);
        } else {
            fatalCallback("Reading packet failed (Lost connection?)");
        }
    };

    Communication.prototype.readMultiplePackets = function(
        count, callback, fatalCallback) {
        _readMultiplePackets.call(this, 0, count, [], callback, fatalCallback);
    };

    Communication.prototype.writePacket = function(packet, callback, errorCallback) {
        Debug.trace("writePacket");
        if (this.isConnected()) {
            this.socketImpl.write(packet, callback, errorCallback);
        } else {
            errorCallback("Writing packet failed (Lost connection?)");
        }
    };

    Communication.prototype.createPacket = function(buffer) {
        return new Packet(buffer);
    };

    Communication.prototype.establishTls = function(ca, checkCN, callback, fatalCallback) {
        this.socketImpl.establishTls(ca, checkCN, callback, fatalCallback);
    };

    // Private Methods

    var _readMultiplePackets = function(
        current, count, result, callback, fatalCallback) {
        this.readPacket(function(packet) {
            result.push(packet);
            current += 1;
            if (current < count) {
                _readMultiplePackets.call(
                    this, current, count, result, callback, fatalCallback);
            } else {
                callback(result);
            }
        }.bind(this), fatalCallback);
    };

    var _readPacketSize = function(length, callback, fatalCallback) {
        Debug.trace("_readPacketSize");
        _read.call(this, length, function(readInfo) {
            Debug.trace("_readPacketSize - 2");
            var buffer = readInfo.data;
            var array = new Uint8Array(buffer);
            if (array[0] === 0x00) { // Normak Message
                var view = new DataView(buffer);
                var result = view.getUint32(0, false);
                callback(result);
            } else if (array[0] === Constants.NBT_SESSION_KEEPALIVE) {
                Debug.log("NBT_SESSION_KEEPALIVE received. Ignore.");
                _readPacketSize.call(this, length, callback, fatalCallback);
            } else {
                Debug.outputArrayBuffer(buffer);
                fatalCallback("Unknown packet received");
            }
        }.bind(this), fatalCallback);
    };

    var _read = function(length, callback, fatalCallback) {
        this.socketImpl.read(length, callback, fatalCallback);
    };

    // Export

    SmbClient.Communication = Communication;

})(SmbClient.Packet, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);
