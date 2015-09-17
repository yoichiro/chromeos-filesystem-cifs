(function(Debug) {

    "use strict";

    // Constructor

    var CifsFS = function() {
        this.cifsClientMap_ = {};
        this.taskQueue_ = {};
        this.opened_files_ = {};
        this.metadataCache_ = {};
        this.watchers_ = {};
        assignEventHandlers.call(this);
    };

    // Public functions

    CifsFS.prototype.getSharedResources = function(options) {
        var cifsClient = new CifsClient(
            this,
            options.serverName,
            options.serverPort,
            options.username,
            options.password,
            options.domainName
        );
        cifsClient.setup();
        cifsClient.getSharedResources({
            onSuccess: function(result) {
                options.onSuccess(result);
            }.bind(this),
            onError: function(reason) {
                showNotification.call(this, reason);
                options.onError(reason);
            }.bind(this)
        });
    };

    CifsFS.prototype.mount = function(options) {
        var fileSystemId = createFileSystemID.call(
            this, options.serverName, options.serverPort, options.username, options.domainName, options.sharedResource);
        var cifsClient = new CifsClient(
            this,
            options.serverName, options.serverPort,
            options.username, options.password,
            options.domainName, options.sharedResource);
        this.cifsClientMap_[fileSystemId] = cifsClient;
        // createTaskQueue.call(this, fileSystemId);
        cifsClient.setup();
        // var requestId = new Date().getTime() % 2147483647;
        var requestId = createRequestId.call(this);
        cifsClient.connect({
            requestId: requestId,
            onSuccess: function(result) {
                doMount.call(
                    this,
                    cifsClient.getServerName(), cifsClient.getServerPort(),
                    cifsClient.getUsername(), cifsClient.getPassword(),
                    cifsClient.getDomainName(), cifsClient.getSharedResource(),
                    function() {
                        options.onSuccess();
                    }.bind(this));
            }.bind(this),
            onError: options.onError
        });
    };

    CifsFS.prototype.resume = function(fileSystemId, onSuccess, onError) {
        Debug.trace("resume - start");
        getMountedCredential.call(this, fileSystemId, function(credential) {
            if (credential) {
                this.mount({
                    serverName: credential.serverName,
                    serverPort: credential.serverPort,
                    username: credential.username,
                    password: credential.password,
                    domainName: credential.domainName,
                    sharedResource: credential.sharedResource,
                    onSuccess: function() {
                        Debug.log("Resumed file system: " + fileSystemId);
                        onSuccess();
                    }.bind(this),
                    onError: function(reason) {
                        handleError.call(this, reason, reason, onError);
                    }.bind(this)
                });
            } else {
                onError("Credential[" + fileSystemId + "] not found");
            }
        }.bind(this));
    };

    CifsFS.prototype.onUnmountRequested = function(options, successCallback, errorCallback) {
        Debug.trace("onUnmountRequested");
        Debug.trace(options);
        var cifsClient = getCifsClient.call(this, options.fileSystemId);
        doUnmount.call(this, cifsClient, options.requestId, successCallback);
    };

    CifsFS.prototype.onReadDirectoryRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.readDirectory({
                requestId: requestId,
                path: options.directoryPath,
                onSuccess: function(result) {
                    Debug.trace(result);
                    var metadataCache = getMetadataCache.call(this, options.fileSystemId);
                    metadataCache.put(options.directoryPath, result.metadataList);
                    successCallback(result.metadataList, false);
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onGetMetadataRequested = function(options, successCallback, errorCallback) {
        Debug.trace("onGetMetadataRequested: thumbnail=" + options.thumbnail);
        Debug.trace(options);
        var cifsClient = getCifsClient.call(this, options.fileSystemId);
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            var metadataCache = getMetadataCache.call(this, options.fileSystemId);
            var cache = metadataCache.get(options.entryPath);
            if (cache.directoryExists && cache.fileExists) {
                successCallback(cache.metadata);
                closeCallback();
            } else {
                cifsClient.getMetadata({
                    requestId: requestId,
                    path: options.entryPath,
                    onSuccess: function(result) {
                        Debug.trace(result);
                        successCallback(result.metadata);
                        closeCallback();
                    }.bind(this),
                    onError: function(reason) {
                        if (reason === "NOT_FOUND") {
                            errorCallback("NOT_FOUND");
                        } else {
                            handleError.call(this, reason, "FAILED", errorCallback);
                        }
                        closeCallback();
                    }.bind(this)
                });
            }
        }.bind(this), function(reason) {
            Debug.error(reason);
            errorCallback("FAILED");
        }.bind(this));
    };

    CifsFS.prototype.onOpenFileRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            var openedFiles = getOpenedFiles.call(this, options.fileSystemId);
            openedFiles[options.requestId] = options.filePath;
            successCallback();
            closeCallback();
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onReadFileRequested = function(cifsClient, options, successCallback, errorCallback) {
        var filePath = getOpenedFiles.call(this, options.fileSystemId)[options.openRequestId];
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.readFile({
                requestId: requestId,
                path: filePath,
                offset: options.offset,
                length: options.length,
                onSuccess: function(result) {
                    Debug.info(result);
                    successCallback(result.data, result.hasMore);
                    if (!result.hasMore) {
                        closeCallback();
                    }
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onCloseFileRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            var openedFiles = getOpenedFiles.call(this, options.fileSystemId);
            delete openedFiles[options.openRequestId];
            successCallback();
            closeCallback();
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onCreateDirectoryRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.createDirectory({
                requestId: requestId,
                path: options.directoryPath,
                onSuccess: function() {
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onDeleteEntryRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.deleteEntry({
                requestId: requestId,
                path: options.entryPath,
                onSuccess: function() {
                    var metadataCache = getMetadataCache.call(this, options.fileSystemId);
                    metadataCache.remove(options.entryPath);
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onMoveEntryRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.moveEntry({
                requestId: requestId,
                sourcePath: options.sourcePath,
                targetPath: options.targetPath,
                onSuccess: function() {
                    var metadataCache = getMetadataCache.call(this, options.fileSystemId);
                    metadataCache.remove(options.sourcePath);
                    metadataCache.remove(options.targetPath);
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onCopyEntryRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.copyEntry({
                requestId: requestId,
                sourcePath: options.sourcePath,
                targetPath: options.targetPath,
                onSuccess: function() {
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onWriteFileRequested = function(cifsClient, options, successCallback, errorCallback) {
        var filePath = getOpenedFiles.call(this, options.fileSystemId)[options.openRequestId];
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.writeFile({
                requestId: requestId,
                path: filePath,
                offset: options.offset,
                data: options.data,
                onSuccess: function() {
                    var metadataCache = getMetadataCache.call(this, options.fileSystemId);
                    metadataCache.remove(filePath);
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onTruncateRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.truncate({
                requestId: requestId,
                path: options.filePath,
                length: options.length,
                onSuccess: function() {
                    successCallback(false);
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onCreateFileRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            cifsClient.createFile({
                requestId: requestId,
                path: options.filePath,
                onSuccess: function() {
                    var metadataCache = getMetadataCache.call(this, options.fileSystemId);
                    metadataCache.remove(options.filePath);
                    successCallback();
                    closeCallback();
                }.bind(this),
                onError: function(reason) {
                    handleError.call(this, reason, "FAILED", errorCallback);
                    closeCallback();
                }
            });
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.checkAlreadyMounted = function(serverName, serverPort, username, domainName, sharedResource, callback) {
        var fileSystemId = createFileSystemID.call(this, serverName, serverPort, username, domainName, sharedResource);
        chrome.fileSystemProvider.getAll(function(fileSystems) {
            for (var i = 0; i < fileSystems.length; i++) {
                if (fileSystems[i].fileSystemId === fileSystemId) {
                    callback(true);
                    return;
                }
            }
            callback(false);
        }.bind(this));
    };

    CifsFS.prototype.onAddWatcherRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            var watchers = getWatchers.call(this, options.fileSystemId);
            watchers.add(options.entryPath);
            successCallback();
            closeCallback();
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };

    CifsFS.prototype.onRemoveWatcherRequested = function(cifsClient, options, successCallback, errorCallback) {
        var requestId = createRequestId.call(this);
        prepare.call(this, cifsClient, requestId, function(closeCallback) {
            var watchers = getWatchers.call(this, options.fileSystemId);
            watchers.delete(options.entryPath);
            successCallback();
            closeCallback();
        }.bind(this), function(reason) {
            handleError.call(this, reason, "FAILED", errorCallback);
        }.bind(this));
    };
    
    CifsFS.prototype.onAlarm = function(alarm) {
        for (var fileSystemId in this.watchers_) {
            var cifsClient = getCifsClient.call(this, fileSystemId);
            var watchers = this.watchers_[fileSystemId];
            for (var watcher of watchers.values()) {
                watchDirectory.call(this, fileSystemId, cifsClient, createRequestId.call(this), watcher);
            }
        }
    };

    // Private functions

    var doMount = function(serverName, serverPort, username, password, domainName, sharedResource, callback) {
        this.checkAlreadyMounted(serverName, serverPort, username, domainName, sharedResource, function(exists) {
            if (!exists) {
                var fileSystemId = createFileSystemID.call(this, serverName, serverPort, username, domainName, sharedResource);
                var displayName = serverName;
                if (Number(serverPort) !== 445) {
                    displayName += ":" + serverPort + "/" + sharedResource;
                }
                if (username) {
                    if (domainName) {
                        displayName += " (" + domainName + "@" + username + ")";
                    } else {
                        displayName += " (" + username + ")";
                    }
                }
                chrome.fileSystemProvider.mount({
                    fileSystemId: fileSystemId,
                    displayName: displayName,
                    writable: true
                }, function() {
                    registerMountedCredential(
                        serverName, serverPort, username, password, domainName, sharedResource,
                        function() {
                            callback();
                        }.bind(this));
                }.bind(this));
            } else {
                callback();
            }
        }.bind(this));
    };

    var doUnmount = function(cifsClient, requestId, successCallback) {
        Debug.trace("doUnmount");
        _doUnmount.call(
            this,
            cifsClient.getServerName(),
            cifsClient.getServerPort(),
            cifsClient.getUsername(),
            cifsClient.getDomainName(),
            cifsClient.getSharedResource(),
            function() {
                successCallback();
            }.bind(this));
    };

    var _doUnmount = function(serverName, serverPort, username, domainName, sharedResource, successCallback) {
        Debug.trace("_doUnmount");
        unregisterMountedCredential.call(
            this, serverName, serverPort, username, domainName, sharedResource,
            function() {
                var fileSystemId = createFileSystemID.call(this, serverName, serverPort, username, domainName, sharedResource);
                Debug.trace(fileSystemId);
                chrome.fileSystemProvider.unmount({
                    fileSystemId: fileSystemId
                }, function() {
                    var deleteTemporaryInfo = function() {
                        delete this.cifsClientMap_[fileSystemId];
                        deleteTaskQueue.call(this, fileSystemId);
                        deleteMetadataCache.call(this, fileSystemId);
                        successCallback();
                    }.bind(this);
                    var client = getCifsClient.call(this, fileSystemId);
                    client.close({
                        onSuccess: function() {
                            deleteTemporaryInfo();
                        }.bind(this),
                        onError: function(error) {
                            deleteTemporaryInfo();
                        }.bind(this)
                    });
                }.bind(this));
            }.bind(this));
    };

    var registerMountedCredential = function(
            serverName, serverPort, username, password, domainName, sharedResource, callback) {
        var fileSystemId = createFileSystemID.call(this, serverName, serverPort, username, domainName, sharedResource);
        chrome.storage.local.get("mountedCredentials", function(items) {
            var mountedCredentials = items.mountedCredentials || {};
            mountedCredentials[fileSystemId] = {
                serverName: serverName,
                serverPort: serverPort,
                username: username,
                password: password,
                domainName: domainName,
                sharedResource: sharedResource
            };
            chrome.storage.local.set({
                mountedCredentials: mountedCredentials
            }, function() {
                callback();
            }.bind(this));
        }.bind(this));
    };

    var unregisterMountedCredential = function(serverName, serverPort, username, domainName, sharedResource, callback) {
        var fileSystemId = createFileSystemID.call(this, serverName, serverPort, username, domainName, sharedResource);
        chrome.storage.local.get("mountedCredentials", function(items) {
            var mountedCredentials = items.mountedCredentials || {};
            delete mountedCredentials[fileSystemId];
            chrome.storage.local.set({
                mountedCredentials: mountedCredentials
            }, function() {
                callback();
            }.bind(this));
        }.bind(this));
    };

    var getMountedCredential = function(fileSystemId, callback) {
        chrome.storage.local.get("mountedCredentials", function(items) {
            var mountedCredentials = items.mountedCredentials || {};
            var credential = mountedCredentials[fileSystemId];
            callback(credential);
        }.bind(this));
    };

    var createFileSystemID = function(serverName, serverPort, username, domainName, sharedResource) {
        var id = "cifsfs://" + serverName + ":" + serverPort + "/" + domainName + "@" + username + "/" + sharedResource;
        return id;
    };

    var createEventHandler = function(callback) {
        return function(options, successCallback, errorCallback) {
            var fileSystemId = options.fileSystemId;
            addTaskQueue.call(this, fileSystemId, function() {
                var cifsClient = getCifsClient.call(this, fileSystemId);
                if (!cifsClient) {
                    this.resume(fileSystemId, function() {
                        callback(options, successCallback, errorCallback);
                    }.bind(this), function(reason) {
                        Debug.error("resume failed: " + reason);
                        showNotification.call(this, "Resuming connection failed. Unmount.");
                        getMountedCredential.call(this, fileSystemId, function(credential) {
                            if (credential) {
                                _doUnmount.call(
                                    this,
                                    credential.serverName,
                                    credential.serverPort,
                                    credential.username,
                                    credential.domainName,
                                    credential.sharedResource,
                                    function() {
                                        errorCallback("FAILED");
                                    }.bind(this));
                            } else {
                                Debug.error("Credential for [" + fileSystemId + "] not found.");
                                errorCallback("FAILED");
                            }
                        }.bind(this));
                    }.bind(this));
                } else {
                    callback(options, successCallback, function(error) {
                        Debug.info(error);
                        if (error === "IO") {
                            Debug.info("Re-try to establish connection");
                            var requestId = createRequestId.call(this);
                            cifsClient.connect({
                                requestId: requestId,
                                onSuccess: function(result) {
                                    callback(options, successCallback, errorCallback);
                                }.bind(this),
                                onError: function(error) {
                                    Debug.error(error);
                                    showNotification(error);
                                    errorCallback("IO");
                                }.bind(this)
                            });
                        } else {
                            errorCallback(error);
                        }
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this);
    };

    var assignEventHandlers = function() {
        chrome.alarms.onAlarm.addListener(
            function(alarm) {
                if (alarm.name === "cifs_alarm") {
                    this.onAlarm(alarm);
                }
            }.bind(this));
        chrome.alarms.create("cifs_alarm", {
            delayInMinutes: 1,
            periodInMinutes: 1
        });
        chrome.fileSystemProvider.onUnmountRequested.addListener(
            function(options, successCallback, errorCallback) { // Unmount immediately
                var fileSystemId = options.fileSystemId;
                var cifsClient = getCifsClient.call(this, fileSystemId);
                if (!cifsClient) {
                    this.resume(fileSystemId, function() {
                        this.onUnmountRequested(options, successCallback, errorCallback);
                    }.bind(this), function(reason) {
                        Debug.error("resume failed: " + reason);
                        showNotification.call(this, "resume failed: " + reason);
                        errorCallback("FAILED");
                    }.bind(this));
                } else {
                    this.onUnmountRequested(options, successCallback, errorCallback);
                }
            }.bind(this));
        chrome.fileSystemProvider.onGetMetadataRequested.addListener(
            function(options, successCallback, errorCallback) {
                var handler = createEventHandler.call(this, function(options, successCallback, errorCallback) {
                    this.onGetMetadataRequested(options, successCallback, errorCallback);
                }.bind(this));
                var fileSystemId = options.fileSystemId;
                var cifsClient = getCifsClient.call(this, fileSystemId);
                if (cifsClient) {
                    var metadataCache = getMetadataCache.call(this, fileSystemId);
                    var cache = metadataCache.get(options.entryPath);
                    if (cache.directoryExists && cache.fileExists) {
                        successCallback(cache.metadata);
                    } else {
                        handler(options, successCallback, errorCallback);
                    }
                } else {
                    handler(options, successCallback, errorCallback);
                }
            }.bind(this));

        var funcNameList = [
            "onReadDirectoryRequested",
            "onOpenFileRequested",
            "onReadFileRequested",
            "onCloseFileRequested",
            "onCreateDirectoryRequested",
            "onDeleteEntryRequested",
            "onMoveEntryRequested",
            "onCopyEntryRequested",
            "onWriteFileRequested",
            "onTruncateRequested",
            "onCreateFileRequested",
            "onAddWatcherRequested",
            "onRemoveWatcherRequested"
        ];
        var caller = function(self, funcName) {
            return function(options, successCallback, errorCallback) {
                console.log(funcName, options);
                var cifsClient = getCifsClient.call(this, options.fileSystemId);
                this[funcName](cifsClient, options, successCallback, errorCallback);
            }.bind(self);
        };
        for (var i = 0; i < funcNameList.length; i++) {
            chrome.fileSystemProvider[funcNameList[i]].addListener(
                createEventHandler.call(
                    this,
                    caller(this, funcNameList[i])
                )
            );
        }
    };

    var getCifsClient = function(fileSystemID) {
        var cifsClient = this.cifsClientMap_[fileSystemID];
        return cifsClient;
    };

    var prepare = function(cifsClient, requestId, onSuccess, onError) {
        var closeCallback = (function(self, cifsClient) {
            return function() {
                if (chrome.runtime.lastError) {
                    Debug.error(chrome.runtime.lastError);
                }
                var fileSystemId = createFileSystemID.call(self,
                    cifsClient.getServerName(), cifsClient.getServerPort(),
                    cifsClient.getUsername(), cifsClient.getDomainName(),
                    cifsClient.getSharedResource());
                shiftAndConsumeQueue.call(self, fileSystemId);
            }.bind(self);
        })(this, cifsClient);
        onSuccess(closeCallback);
    };

    var getTaskQueue = function(fileSystemId) {
        var taskQueue = this.taskQueue_[fileSystemId];
        if (!taskQueue) {
            taskQueue = new TaskQueue();
            this.taskQueue_[fileSystemId] = taskQueue;
            Debug.trace("getTaskQueue: Created. " + fileSystemId);
        }
        return taskQueue;
    };

    var deleteTaskQueue = function(fileSystemId) {
        Debug.trace("deleteTaskQueue: " + fileSystemId);
        delete this.taskQueue_[fileSystemId];
    };

    var addTaskQueue = function(fileSystemId, task) {
        var taskQueue = getTaskQueue.call(this, fileSystemId);
        taskQueue.addTask(task);
    };

    var shiftAndConsumeQueue = function(fileSystemId) {
        var taskQueue = getTaskQueue.call(this, fileSystemId);
        taskQueue.shiftAndConsumeTask();
    };

    var getOpenedFiles = function(fileSystemId) {
        var openedFiles = this.opened_files_[fileSystemId];
        if (!openedFiles) {
            openedFiles = {};
            this.opened_files_[fileSystemId] = openedFiles;
        }
        return openedFiles;
    };

    var createRequestId = function() {
        // var requestId = options.requestId;
        var requestId = 0;
        return requestId;
    };

    var getMetadataCache = function(fileSystemId) {
        var metadataCache = this.metadataCache_[fileSystemId];
        if (!metadataCache) {
            metadataCache = new MetadataCache();
            this.metadataCache_[fileSystemId] = metadataCache;
            Debug.trace("getMetadataCache: Created. " + fileSystemId);
        }
        return metadataCache;
    };

    var deleteMetadataCache = function(fileSystemId) {
        Debug.trace("deleteMetadataCache: " + fileSystemId);
        delete this.metadataCache_[fileSystemId];
    };

    var handleError = function(reason, errorCode, onError) {
        Debug.error(reason);
        if (reason === "3221225524: NT_STATUS_OBJECT_NAME_NOT_FOUND") { // for SMB1
            onError("NOT_FOUND");
        } else if (reason === "c0000034: NT_STATUS_OBJECT_NAME_NOT_FOUND") { // for SMB2
            onError("NOT_FOUND");
        } else if (reason === "Sending data failed: -15" ||
                   reason === "Reading packet failed (Lost connection?)" ||
                   reason === "Writing packet failed (Lost connection?)") {
            onError("IO");
        } else {
            showNotification.call(this, reason);
            onError(errorCode);
        }
    };

    var showNotification = function(message) {
        chrome.notifications.create(message, {
            type: "basic",
            title: "SMB/CIFS File System",
            message: message,
            iconUrl: "/icons/48.png"
        }, function(notificationId) {
        }.bind(this));
    };

    var getWatchers = function(fileSystemId) {
        var watchers = this.watchers_[fileSystemId];
        if (!watchers) {
            watchers = new Set();
            this.watchers_[fileSystemId] = watchers;
        }
        return watchers;
    };
    
    var notifyEntryChanged = function(fileSystemId, directoryPath, changeType, entryPath) {
        chrome.fileSystemProvider.notify({
            fileSystemId: fileSystemId,
            observedPath: directoryPath,
            recursive: false,
            changeType: "CHANGED",
            changes: [
                {entryPath: entryPath, changeType: changeType}
            ]
        }, function() {
        }.bind(this));
    };
    
    var watchDirectory = function(fileSystemId, cifsClient, requestId, entryPath) {
        addTaskQueue.call(this, fileSystemId, function() {
            prepare.call(this, cifsClient, requestId, function(closeCallback) {
                console.log(entryPath);
                cifsClient.readDirectory({
                    requestId: requestId,
                    path: entryPath,
                    onSuccess: function(result) {
                        Debug.trace(result);
                        var metadataCache = getMetadataCache.call(this, fileSystemId);
                        var currentList = result.metadataList;
                        var oldList = metadataCache.dir(entryPath) || {};
                        var nameSet = new Set();
                        for (var i = 0; i < currentList.length; i++) {
                            var current = currentList[i];
                            var old = oldList[current.name];
                            if (old) {
                                // Changed
                                if ((current.size !== old.size) ||
                                        (current.modificationTime !== old.modificationTime)) {
                                    notifyEntryChanged.call(this, fileSystemId, entryPath, "CHANGED", current.name);
                                }
                            } else {
                                // Added
                                notifyEntryChanged.call(this, fileSystemId, entryPath, "CHANGED", current.name);
                            }
                            nameSet.add(current.name);
                        }
                        for (var name in oldList) {
                            if (!nameSet.has(name)) {
                                // Delete
                                notifyEntryChanged.call(this, fileSystemId, entryPath, "DELETED", name);
                            }
                        }
                        metadataCache.put(entryPath, currentList);
                        closeCallback();
                    }.bind(this),
                    onError: function(reason) {
                        // handleError.call(this, reason, "FAILED", errorCallback);
                        console.log(reason);
                        closeCallback();
                    }
                });
            }.bind(this));
        }.bind(this));
    };

    // Export

    window.CifsFS = CifsFS;

})(SmbClient.Debug);
