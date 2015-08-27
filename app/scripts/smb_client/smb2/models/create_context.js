(function(Models, Types) {
    
    // Constructor
    
    var CreateContext = function() {
        this.types_ = new Types();
        
        this.next_ = 0;
        this.name_ = null;
        this.data_ = null;
        this.nextPosition_ = 0;
    };
    
    // Public functions
    
    CreateContext.prototype.createArrayBuffer = function() {
        var total = 16 +
                    this.name_.length +
                    this.types_.getPaddingLength(16 + this.name_.length, 8);
        if (this.data_) {
            total += this.data_.length +
                     this.types_.getPaddingLength(16 + this.data_.length, 8);
        }
        var buffer = new ArrayBuffer(total);
        var array = new Uint8Array(buffer);
        
        var nameOffset = 16;
        var nameLength = this.name_.length;
        
        var dataOffset = 0;
        var dataLength = 0;
        if (this.data_) {
            dataOffset = nameOffset + nameLength + this.types_.getPaddingLength(nameOffset + nameLength, 8);
            dataLength = this.data_.length;
        }
        
        // next
        this.types_.setFixed4BytesValue(this.next_, array, 0);
        // name_offset
        this.types_.setFixed2BytesValue(nameOffset, array, 4);
        // name_length
        this.types_.setFixed2BytesValue(nameLength, array, 6);
        // reserved
        this.types_.setFixed2BytesValue(0, array, 8);
        // data_offset
        this.types_.setFixed2BytesValue(dataOffset, array, 10);
        // data_length
        this.types_.setFixed4BytesValue(dataLength, array, 12);
        // name
        var pos = this.types_.copyArrayWithPadding(this.name_, array, 16, this.name_.length, 8);
        // data
        if (this.data_) {
            pos = this.types_.copyArrayWithPadding(this.data_, array, pos, this.data_.length, 8);
        }
        
        this.nextPosition_ = pos;
        
        return buffer;
    };
    
    CreateContext.prototype.setNext = function(next) {
        this.next_ = next;
    };
    
    // name: Uint8Array
    CreateContext.prototype.setName = function(name) {
        this.name_ = name;
    };
    
    // data: Uint8Array
    CreateContext.prototype.setData = function(data) {
        this.data_ = data;
    };
    
    CreateContext.prototype.getNextPosition = function() {
        return this.nextPosition_;
    };
    
    CreateContext.prototype.set = function(next, name, data) {
        this.setNext(next);
        this.setName(name);
        this.setData(data);
    };
    
    // Export
    
    Models.CreateContext = CreateContext;
    
})(SmbClient.Smb2.Models, SmbClient.Types);