(function(Debug) {

    "use strict";

    var TaskQueue = function() {
        this.queue_ = [];
    };

    TaskQueue.prototype.addTask = function(task) {
        this.queue_.push(task);
        if (this.queue_.length === 1) {
            setTimeout(function() {
                Debug.trace("TaskQueue: addTask - Call consume task: length=" + this.queue_.length);
                this.consumeTask();
            }.bind(this), 10);
        }
    };

    TaskQueue.prototype.consumeTask = function() {
        if (this.queue_.length > 0) {
            var task = this.queue_[0];
            if (task) {
                Debug.trace("TaskQueue: consumeTask - execute task: length=" + this.queue_.length);
                task();
            } else {
                this.queue_.shift();
                this.consumeTask();
            }
        } else {
            Debug.trace("TaskQueue: consumeTask - queue: empty");
        }
    };

    TaskQueue.prototype.shiftAndConsumeTask = function() {
        this.queue_.shift();
        this.consumeTask();
    };

    window.TaskQueue = TaskQueue;


})(SmbClient.Debug);
