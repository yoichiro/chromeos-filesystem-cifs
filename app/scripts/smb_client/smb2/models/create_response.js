(function(Models, Types, Debug, Constants) {
    "use strict";
    
    // Constructor
    
    var CreateResponse = function() {
        this.types_ = new Types();
        
        this.structureSize_ = null;
        this.oplockLevel_ = null;
        this.createAction_ = null;
        this.creationTime_ = null;
        this.lastAccessTime_ = null;
        this.lastWriteTime_ = null;
        this.changeTime_ = null;
        this.allocationSize_ = null;
        this.endOfFile_ = null;
        this.fileAttributes_ = null;
        this.fileId_ = null; // Uint8Array
        this.createContexts_ = [];
    };
    
    // Public functions
    
    CreateResponse.prototype.load = function(packet) {
        var array = packet.getPacketHelper().getSmbDataUint8Array();

        this.structureSize_ = this.types_.getFixed2BytesValue(array, 0);
        this.oplockLevel_ = array[2];
        // UCHAR reserved
        this.createAction_ = this.types_.getFixed4BytesValue(array, 4);
        this.creationTime_ = this.types_.getDateFromArray(array, 8);
        this.lastAccessTime_ = this.types_.getDateFromArray(array, 16);
        this.lastWriteTime_ = this.types_.getDateFromArray(array, 24);
        this.changeTime_ = this.types_.getDateFromArray(array, 32);
        this.allocationSize_ = this.types_.getFixed8BytesValue(array, 40);
        this.endOfFile_ = this.types_.getFixed8BytesValue(array, 48);
        this.fileAttributes_ = this.types_.getFixed4BytesValue(array, 56);
        // UINT reserved
        this.fileId_ = array.subarray(64, 80);
        
        var createContextsOffset = this.types_.getFixed4BytesValue(array, 80);
        var createContextsLength = this.types_.getFixed4BytesValue(array, 84);
        if (createContextsOffset !== 0) {
            loadCreateContexts.call(this, createContextsOffset);
        }
    };
    
    CreateResponse.prototype.getStructureSize = function() {
        return this.structureSize_;
    };
    
    CreateResponse.prototype.getOplockLevel = function() {
        return this.oplockLevel_;
    };  

    CreateResponse.prototype.getCreateAction = function() {
        return this.createAction_;
    };  

    CreateResponse.prototype.getCreationTime = function() {
        return this.creationTime_;
    };  

    CreateResponse.prototype.getLastAccessTime = function() {
        return this.lastAccessTime_;
    };  

    CreateResponse.prototype.getLastWriteTime = function() {
        return this.lastWriteTime_;
    };  

    CreateResponse.prototype.getChangeTime = function() {
        return this.changeTime_;
    };  

    CreateResponse.prototype.getAllocationSize = function() {
        return this.allocationSize_;
    };  

    CreateResponse.prototype.getEndOfFile = function() {
        return this.endOfFile_;
    };  

    CreateResponse.prototype.getFileAttributes = function() {
        return this.fileAttributes_;
    };  

    CreateResponse.prototype.getFileId = function() {
        return this.fileId_;
    };  

    CreateResponse.prototype.getCreateContexts = function() {
        return this.createContexts_;
    };
    
    // Private functions
    
    var loadCreateContexts = function(array, pos) {
        var next = this.types_.getFixed4BytesValue(array, pos);
        var nameOffset = this.types_.getFixed2BytesValue(array, pos + 4);
        var nameLength = this.types_.getFixed2BytesValue(array, pos + 6);
        // USHORT reserved
        var dataOffset = this.types_.getFixed2BytesValue(array, pos + 10);
        var dataLength = this.types_.getFixed4BytesValue(array, pos + 12);
        var name = array.subarray(pos + nameOffset, pos + nameOffset + nameLength);
        var data = null;
        if (dataOffset !== 0) {
            data = array.subarray(pos + dataOffset, pos + dataOffset + dataLength);
        }
        var createContext = new CreateContext();
        createContext.set(next, name, data);
        this.createContexts_.push(createContext);
        if (next !== 0) {
            loadCreateContexts.call(this, pos + next);
        }
    };

    // Export
    
    Models.CreateResponse = CreateResponse;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Debug, SmbClient.Constants);