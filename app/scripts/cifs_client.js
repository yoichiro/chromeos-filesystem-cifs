(function() {

    "use strict";

    // Constructor

    var CifsClient = function(
            cifsFS, serverName, serverPort,
            username, password, sharedResource) {
        this.serverName_ = serverName;
        this.serverPort_ = serverPort;
        this.username_ = username;
        this.password_ = password;
        this.sharedResource_ = sharedResource;

        this.cifsFS_ = cifsFS;

        this.client_ = null;
    };

    // Public functions

    CifsClient.prototype.getServerName = function() {
        return this.serverName_;
    };

    CifsClient.prototype.getServerPort = function() {
        return this.serverPort_;
    };

    CifsClient.prototype.getUsername = function() {
        return this.username_;
    };

    CifsClient.prototype.getPassword = function() {
        return this.password_;
    };

    CifsClient.prototype.getSharedResource = function() {
        return this.sharedResource_;
    };

    CifsClient.prototype.setup = function() {
        this.client_ = new SmbClient.Client();
    };

    CifsClient.prototype.getSharedResources = function(options) {
        this.client_.login(
            this.getServerName(),
            Number(this.getServerPort()),
            this.getUsername(),
            this.getPassword(),
            function() {
                this.client_.getSharedResourceList(function(list) {
                    this.close({
                        onSuccess: function() {
                            options.onSuccess(list);
                        }.bind(this),
                        onError: function(error) {
                            options.onError(error);
                        }.bind(this)
                    });
                }.bind(this), function(error) {
                    options.onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                options.onError(error);
            }.bind(this));
    };

    CifsClient.prototype.connect = function(options) {
        this.client_.login(
            this.getServerName(),
            this.getServerPort(),
            this.getUsername(),
            this.getPassword(),
            function() {
                this.client_.connectSharedResource(this.getSharedResource(), function() {
                    options.onSuccess();
                }.bind(this), function(error) {
                    options.onError(error);
                }.bind(this));
            }.bind(this), function(error) {
                options.onError(error);
            }.bind(this));
    };

    CifsClient.prototype.close = function(options) {
        this.client_.logout(function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    // options: requestId, path, onSuccess, onError
    CifsClient.prototype.getMetadata = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.getMetadata(realPath, function(file) {
            var metadata = {
                isDirectory: file.isDirectory(),
                name: file.getFileName(),
                size: file.getEndOfFile(),
                modificationTime: file.getChange()
            };
            options.onSuccess({
                metadata: metadata
            });

        }.bind(this), function(error) {
            if (error === "3221225524: NT_STATUS_OBJECT_NAME_NOT_FOUND") {
                options.onError("NOT_FOUND");
            } else {
                options.onError(error);
            }
        }.bind(this));
    };

    // options: requestId, path, onSuccess, onError
    CifsClient.prototype.readDirectory = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.readDirectory(realPath, function(files) {
            var metadataList = [];
            for (var i = 0; i < files.length; i++) {
                var data = files[i];
                var metadata = {
                    isDirectory: data.isDirectory(),
                    name: data.getFileName(),
                    size: data.getEndOfFile(),
                    modificationTime: data.getChange()
                };
                metadataList.push(metadata);
            }
            options.onSuccess({
                metadataList: metadataList
            });
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.readFile = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.readFile(realPath, options.offset, options.length, function(buffer) {
            options.onSuccess({
                data: buffer,
                hasMore: false
            });
        }.bind(this), function(error) {
            options.onError(error);
        });
    };

    CifsClient.prototype.createDirectory = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.createDirectory(realPath, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    // options: requestId, path, onSuccess, onError
    CifsClient.prototype.deleteEntry = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.deleteEntry(realPath, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.moveEntry = function(options) {
        var realSourcePath = createRealPath.call(this, options.sourcePath);
        var realTargetPath = createRealPath.call(this, options.targetPath);
        this.client_.move(realSourcePath, realTargetPath, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.copyEntry = function(options) {
        var realSourcePath = createRealPath.call(this, options.sourcePath);
        var realTargetPath = createRealPath.call(this, options.targetPath);
        this.client_.copy(realSourcePath, realTargetPath, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.createFile = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.createFile(realPath, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.truncate = function(options) {
        var realPath = createRealPath.call(this, options.path);
        this.client_.truncate(realPath, options.length, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError(error);
        }.bind(this));
    };

    CifsClient.prototype.writeFile = function(options) {
        var data = new Uint8Array(options.data);
        var offset = options.offset;
        var length = data.byteLength;
        var realPath = createRealPath.call(this, options.path);
        this.client_.writeFile(realPath, offset, data, function() {
            options.onSuccess();
        }.bind(this), function(error) {
            options.onError();
        }.bind(this));
    };

    // Private functions

    var showNotification = function(message) {
        chrome.notifications.create("", {
            type: "basic",
            title: "SMB/CIFS File System",
            message: message,
            iconUrl: "/images/48.png"
        }, function(notificationId) {
        }.bind(this));
    };

    var getNameFromPath = function(path) {
        var names = path.split("/");
        var name = names[names.length - 1];
        return name;
    };

    var createRealPath = function(path) {
        //return this.sharedResource_ + path;
        return normalizePath.call(this, path);
    };

    var normalizePath = function(path) {
        return path.split("/").join("\\");
    };

    // Export

    window.CifsClient = CifsClient;

})();
