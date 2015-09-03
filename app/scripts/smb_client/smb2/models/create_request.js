(function(Models, Types, Constants, Debug) {
    "use strict";
    
    // Constructor
    
    var CreateRequest = function() {
        this.types_ = new Types();
        
        this.structureSize_ = 57;
        this.requestedOplockLevel_ = null;
        this.impersonationLevel_ = null;
        this.desiredAccess_ = null;
        this.fileAttributes_ = null;
        this.shareAccess_ = null;
        this.createDisposition_ = null;
        this.createOptions_ = null;
        this.name_ = null;
        this.createContexts_ = null;
    };
    
    // Public functions
    
    CreateRequest.prototype.setStructureSize = function(structureSize) {
        this.structureSize_ = structureSize;
    };
    
    CreateRequest.prototype.setRequestedOplockLevel = function(requestedOplockLevel) {
        this.requestedOplockLevel_ = requestedOplockLevel;
    };
    
    CreateRequest.prototype.setImpersonationLevel = function(impersonationLevel) {
        this.impersonationLevel_ = impersonationLevel;
    };
    
    CreateRequest.prototype.setDesiredAccess = function(desiredAccess) {
        this.desiredAccess_ = desiredAccess;
    };
    
    CreateRequest.prototype.setFileAttributes = function(fileAttributes) {
        this.fileAttributes_ = fileAttributes;
    };
    
    CreateRequest.prototype.setShareAccess = function(shareAccess) {
        this.shareAccess_ = shareAccess;
    };
    
    CreateRequest.prototype.setCreateDisposition = function(createDisposition) {
        this.createDisposition_ = createDisposition;
    };
    
    CreateRequest.prototype.setCreateOptions = function(createOptions) {
        this.createOptions_ = createOptions;
    };
    
    CreateRequest.prototype.setName = function(name) {
        this.name_ = name;
    };
    
    CreateRequest.prototype.setCreateContexts = function(createContexts) {
        this.createContexts_ = createContexts;
    };
    
    CreateRequest.prototype.createArrayBuffer = function() {
        var i = 0;
        
        var nameOffset = Constants.SMB2_HEADER_SIZE + 56;
        var nameLength = this.name_.length * 2;
        var createContextsPositions = [];
        var createContextOffset = nameOffset + nameLength + this.types_.getPaddingLength(nameOffset + nameLength, 8);
        var createContextsLength = 0;
        if (this.createContexts_ && this.createContexts_.length > 0) {
            for (i = 0; i < this.createContexts_.length; i++) {
                var createContext = this.createContexts_[i].createArrayBuffer();
                var createContextLength = createContext.byteLength;
                createContextsPositions.push({
                    buffer: createContext,
                    offset: createContextOffset,
                    length: createContextLength
                });
                var padding = this.types_.getPaddingLength(createContextOffset + createContextLength, 8);
                createContextOffset += createContextLength + padding;
                createContextsLength += createContextLength + padding;
            }
        }

        var total = createContextOffset - Constants.SMB2_HEADER_SIZE;
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        // structure_size
        this.types_.setFixed2BytesValue(this.structureSize_, array, 0);
        // security_flags
        array[2] = 0;
        // requested_oplock_level
        array[3] = this.requestedOplockLevel_;
        // impersonation_level
        this.types_.setFixed4BytesValue(this.impersonationLevel_, array, 4);
        // smb_create_flags
        this.types_.setFixed8BytesValue(0, array, 8);
        // reserved
        this.types_.setFixed8BytesValue(0, array, 16);
        // desired_access
        this.types_.setFixed4BytesValue(this.desiredAccess_, array, 24);
        // file_attributes
        this.types_.setFixed4BytesValue(this.fileAttributes_, array, 28);
        // share_access
        this.types_.setFixed4BytesValue(this.shareAccess_, array, 32);
        // create_disposition
        this.types_.setFixed4BytesValue(this.createDisposition_, array, 36);
        // create_options
        this.types_.setFixed4BytesValue(this.createOptions_, array, 40);
        // name_offset
        this.types_.setFixed2BytesValue(nameOffset, array, 44);
        // name_length
        this.types_.setFixed2BytesValue(nameLength, array, 46);
        // create_contexts_offset
        if (createContextsPositions.length > 0) {
            this.types_.setFixed4BytesValue(createContextsPositions[0].offset, array, 48);
        } else {
            this.types_.setFixed4BytesValue(0, array, 48);
        }
        // create_contexts_length
        if (createContextsPositions.length > 0) {
            this.types_.setFixed4BytesValue(createContextsLength, array, 52);
        } else {
            this.types_.setFixed4BytesValue(0, array, 52);
        }
        // name
        this.types_.setUnicodeString(this.name_, array, 56);
        // create_contexts
        if (createContextsPositions.length > 0) {
            for (i = 0; i < createContextsPositions.length; i++) {
                var position = createContextsPositions[i];
                this.types_.copyArray(new Uint8Array(position.buffer), array,
                                      position.offset - Constants.SMB2_HEADER_SIZE, position.length);
            }
        }

        return buffer;
    };
    
    // Export
    Models.CreateRequest = CreateRequest;
    
})(SmbClient.Smb2.Models, SmbClient.Types, SmbClient.Constants, SmbClient.Debug);