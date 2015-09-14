(function(Spnego) {
    "use strict";
    
    // Constructor
    
    var Asn1Obj = function() {
        this.tag_ = null;
        this.value_ = null; // For primitive
        this.children_ = []; // For constructed
    };
    
    // Public functions
    
    Asn1Obj.prototype.setTag = function(tag) {
        this.tag_ = tag;
    };
    
    Asn1Obj.prototype.setValue = function(value) {
        this.value_ = value;
    };
    
    Asn1Obj.prototype.addChild = function(asn1Obj) {
        this.children_.push(asn1Obj);
    };
    
    Asn1Obj.prototype.getTag = function() {
        return this.tag_;
    };
    
    Asn1Obj.prototype.getValue = function() {
        return this.value_;
    };
    
    Asn1Obj.prototype.getChildren = function() {
        return this.children_;
    };
    
    Asn1Obj.prototype.isPrimitive = function() {
        return (this.tag_ & 0x20) === 0; // If 6th bit === 1, it's constructed.
    };
    
    Asn1Obj.prototype.getValueAsObjectIdentifier = function() {
        if (!this.value_) {
            return null;
        }
        var result = [];
        if (this.value_[0] > 80) {
            result.push(2);
            result.push(80 - this.value_[0]);
        } else if (this.value_[0] > 40) {
            result.push(1);
            result.push(40 - this.value_[0]);
        } else {
            result.push(0);
            result.push(this.value_[0]);
        }
        return result.join(".");
    };
    
    // Static functions
    
    // array: Uint8Array
    Asn1Obj.load = function(array) {
        var root = new Asn1Obj();
        loadInConstructed.call(this, root, array, 0);
        return root.getChildren()[0];
    };
    
    // Private functions
    
    var loadInConstructed = function(parent, array, pos) {
        if (array.length <= pos) {
            return;
        }
        var tag = array[pos];
        var obj = new Asn1Obj();
        obj.setTag(tag);
        var valueAndNext = loadValueAndNext.call(this, array, pos + 1);
        var value = valueAndNext.value;
        var next = valueAndNext.next;
        if (obj.isPrimitive()) {
            obj.setValue(value);
            parent.addChild(obj);
        } else {
            parent.addChild(obj);
            loadInConstructed.call(this, obj, value, 0);
        }
        loadInConstructed.call(this, parent, array, next);
    };
    
    var loadValueAndNext = function(array, pos) {
        var value = null;
        var length1 = array[pos];
        var next = null;
        if (length1 <= 0x7f) {
            value = array.subarray(pos + 1, pos + 1 + length1);
            next = pos + 1 + length1;
        } else if (length1 === 0x81) {
            value = array.subarray(pos + 2, pos + 2 + array[pos + 1]);
            next = pos + 2 + array[pos + 1];
        } else if (length1 === 0x82) {
            value = array.subarray(pos + 3, pos + 3 + view.getInt16(pos + 1, false));
            next = pos + 3 + view.getInt16(pos + 1, false);
        } else if (length1 === 0x80) {
            for (var i = pos + 1; i < array.length - 1; i++) {
                if (view.getInt16(i, false) === 0) {
                    value = array.subarray(pos + 1, i);
                    next = i + 2;
                    break;
                }
            }
        }
        return {
            value: value,
            next: next
        };
    };

    // Export
    
    Spnego.Asn1Obj = Asn1Obj;
    
})(SmbClient.Spnego);