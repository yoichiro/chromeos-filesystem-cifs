(function(Debug) {

    "use strict";

    var cifs_fs_ = new CifsFS();
    
    var setDebugLevel = function() {
        /*
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings;
            var debugLevel = settings.debugLevel;
            if (typeof debugLevel === "undefined") {
                debugLevel = 2;
            }
            Debug.Level = debugLevel;
        });
        */
        Debug.Level = 0;
    };

    var openWindow = function() {
        chrome.app.window.create("window.html", {
            outerBounds: {
                width: 800,
                height: 540
            },
            resizable: false
        });
    };

    var assignEventListeners = function() {
        chrome.app.runtime.onLaunched.addListener(openWindow);
    
        if (chrome.fileSystemProvider.onMountRequested) {
            chrome.fileSystemProvider.onMountRequested.addListener(openWindow);
        }

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            Debug.trace(request);
            switch(request.type) {
            case "getSharedResources":
                getSharedResources(request, sendResponse);
                break;
            case "mount":
                doMount(request, sendResponse);
                break;
            case "refreshDebugLevel":
                setDebugLevel();
                break;
            default:
                var message;
                if (request.type) {
                    message = "Invalid request type: " + request.type + ".";
                } else {
                    message = "No request type provided.";
                }
                sendResponse({
                    type: "error",
                    success: false,
                    message: message
                });
                break;
            }
            return true;
        });
    };

    var getSharedResources = function(request, sendResponse) {
        cifs_fs_.getSharedResources({
            serverName: request.serverName,
            serverPort: request.serverPort,
            username: request.username,
            password: request.password,
            domainName: request.domainName,
            onSuccess: function(result) {
                var sharedResources = [];
                for (var i = 0; i < result.length; i++) {
                    if (result[i].type === 0) {
                        sharedResources.push(result[i]);
                    }
                }
                sendResponse({
                    type: "sharedResources",
                    sharedResources: sharedResources
                });
            }.bind(this),
            onError: function(error) {
                sendResponse({
                    type: "error",
                    success: false,
                    message: error
                });
            }.bind(this)
        });
    };

    var doMount = function(request, sendResponse) {
        cifs_fs_.checkAlreadyMounted(request.serverName, request.serverPort,request.username, request.domainName, request.sharedResource, function(exists) {
            if (exists) {
                sendResponse({
                    type: "error",
                    error: "Already mounted"
                });
            } else {
                var options = {
                    serverName: request.serverName,
                    serverPort: request.serverPort,
                    username: request.username,
                    password: request.password,
                    domainName: request.domainName,
                    sharedResource: request.sharedResource,
                    onSuccess: function(algorithm, fingerprint, requestId, fileSystemId) {
                        sendResponse({
                            success: true
                        });
                    },
                    onError: function(reason) {
                        sendResponse({
                            success: false,
                            error: reason
                        });
                    }
                };
                cifs_fs_.mount(options);
            }
        });
    };

    setDebugLevel();
    assignEventListeners();

})(SmbClient.Debug);
