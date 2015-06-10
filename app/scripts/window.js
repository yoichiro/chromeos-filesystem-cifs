"use strict";

(function() {

    var onLoad = function() {
        loadKeptCredentials();
        assignEventHandlers();
    };

    var assignEventHandlers = function() {
        var btnMount = document.querySelector("#btnMount");
        btnMount.addEventListener("click", function(e) {
            onClickedBtnMount(e);
        });
        var btnKeep = document.querySelector("#btnKeep");
        btnKeep.addEventListener("click", function(e) {
            onClickedBtnKeep(e);
        });
        var btnCancel = document.querySelector("#btnCancel");
        btnCancel.addEventListener("click", function(e) {
            onClickedBtnCancel(e);
        });
        var btnConnect = document.querySelector("#btnConnect");
        btnConnect.addEventListener("click", function(e) {
            onClickedBtnConnect(e);
        });
        var password = document.querySelector("#password");
        password.addEventListener("change", function(e) {
            if (document.activeElement === this) {
                onClickedBtnMount(e);
            }
        });
        // Settings dialog
        var btnSettings = document.querySelector("#btnSettings");
        btnSettings.addEventListener("click", function(e) {
            onClickedBtnSettings(e);
        });
        var keepPasswordYes = document.querySelector("#keepPasswordYes");
        keepPasswordYes.addEventListener("core-change", onChangeKeepPassword);
        var keepPasswordNo = document.querySelector("#keepPasswordNo");
        keepPasswordNo.addEventListener("core-change", onChangeKeepPassword);
        /*
        var debugLevelTrace = document.querySelector("#debugLevelTrace");
        debugLevelTrace.addEventListener("core-change", onChangeDebugLevel);
        var debugLevelInfo = document.querySelector("#debugLevelInfo");
        debugLevelInfo.addEventListener("core-change", onChangeDebugLevel);
        var debugLevelError = document.querySelector("#debugLevelError");
        debugLevelError.addEventListener("core-change", onChangeDebugLevel);
        */
    };

    var onClickedBtnMount = function(evt) {
        console.log("onClickedBtnMount");
        var btnMount = document.querySelector("#btnMount");
        evt.preventDefault();
        btnMount.setAttribute("disabled", "true");
        document.getElementById("toast-mount-attempt").show();
        var request = {
            type: "getSharedResources",
            serverName: document.querySelector("#serverName").value,
            serverPort: document.querySelector("#serverPort").value,
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value,
            domainName: document.querySelector("#domainName").value
        };
        chrome.runtime.sendMessage(request, function(response) {
            console.log(response);
            if (response.type === "sharedResources") {
                var sharedResources = document.querySelector("#sharedResources");
                sharedResources.innerHTML = "";
                for (var i = 0; i < response.sharedResources.length; i++) {
                    var radio = document.createElement("paper-radio-button");
                    radio.name = response.sharedResources[i].name;
                    radio.label = response.sharedResources[i].name;
                    sharedResources.appendChild(radio);
                }
                sharedResources.selected = response.sharedResources[0].name;
                document.querySelector("#selectSharedResourceDialog").toggle();
            } else {
                var toast = document.getElementById("toast-mount-fail");
                if (response.error) {
                    toast.setAttribute("text", response.error);
                }
                toast.show();
                btnMount.removeAttribute("disabled");
            }
        });
    };

    var mount = function() {
        var serverName = document.querySelector("#serverName").value;
        var serverPort = document.querySelector("#serverPort").value;
        var username = document.querySelector("#username").value;
        var password = document.querySelector("#password").value;
        var domainName = document.querySelector("#domainName").value;
        var sharedResource = document.querySelector("#sharedResources").selected;
        var request = {
            type: "mount",
            serverName: serverName,
            serverPort: serverPort,
            username: username,
            password: password,
            domainName: domainName,
            sharedResource: sharedResource
        };
        chrome.runtime.sendMessage(request, function(response) {
            if (response.success) {
                document.getElementById("toast-mount-success").show();
                window.setTimeout(function() {
                    window.close();
                }, 2000);
            } else {
                var toast = document.getElementById("toast-mount-fail");
                if (response.error) {
                    toast.setAttribute("text", response.error);
                }
                toast.show();
                var btnMount = document.querySelector("#btnMount");
                btnMount.removeAttribute("disabled");
            }
        });
    };

    var onClickedBtnConnect = function(evt) {
        console.log("onClickedBtnConnect");
        mount();
    };

    var onClickedBtnCancel = function(evt) {
        console.log("onClickedBtnCancel");
        var btnMount = document.querySelector("#btnMount");
        btnMount.removeAttribute("disabled");
    };

    var setMessageResources = function() {
        var selector = "data-message";
        var elements = document.querySelectorAll("[" + selector + "]");

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            var messageID = element.getAttribute(selector);
            var messageText = chrome.i18n.getMessage(messageID);

            var textNode = null;

            switch(element.tagName.toLowerCase()) {
            case "paper-button":
                textNode = document.createTextNode(messageText);
                element.appendChild(textNode);
                break;
            case "paper-input":
            case "paper-input-decorator":
            case "paper-radio-button":
                element.setAttribute("label", messageText);
                break;
            case "paper-toast":
                element.setAttribute("text", messageText);
                break;
            case "h2":
            case "title":
                textNode = document.createTextNode(messageText);
                element.appendChild(textNode);
                break;
            }
        }
    };

    var onClickedBtnKeep = function(evt) {
        console.log("onClickedBtnKeep");
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var keepPassword = settings.keepPassword || "keepPasswordNo";
            keepPassword = (keepPassword === "keepPasswordYes");
            var serverName = document.querySelector("#serverName").value;
            var serverPort = document.querySelector("#serverPort").value;
            var username = document.querySelector("#username").value;
            var password = document.querySelector("#password").value;
            var domainName = document.querySelector("#domainName").value;
            if (serverName && serverPort && username) {
                chrome.storage.local.get("keptCredentials", function(items) {
                    var credentials = items.keptCredentials || {};
                    var key = createKey(serverName, serverPort, username);
                    var credential = {
                        serverName: serverName,
                        serverPort: serverPort,
                        username: username,
                        domainName: domainName
                    };
                    if (keepPassword) {
                        credential.password = password;
                    }
                    credentials[key] = credential;
                    chrome.storage.local.set({
                        keptCredentials: credentials
                    }, function() {
                        loadKeptCredentials();
                    });
                });
            }
        });
    };

    var loadKeptCredentials = function() {
        chrome.storage.local.get("keptCredentials", function(items) {
            document.querySelector("#credentials").innerHTML = "";
            var credentials = items.keptCredentials || {};
            for (var key in credentials) {
                appendCredentialToScreen(credentials[key]);
            }
        });
    };

    var appendCredentialToScreen = function(credential) {
        var credentials = document.querySelector("#credentials");
        var div = document.createElement("div");
        div.setAttribute("horizontal", "true");
        div.setAttribute("layout", "true");
        div.setAttribute("center", "true");
        var item = document.createElement("paper-item");
        item.textContent = createKey(credential.serverName, credential.serverPort, credential.username);
        item.addEventListener("click", (function(credential) {
            return function(evt) {
                setCredentialToForm(credential);
            };
        })(credential));
        div.appendChild(item);
        var btnClose = document.createElement("paper-icon-button");
        btnClose.setAttribute("icon", "close");
        btnClose.setAttribute("title", "Delete");
        btnClose.addEventListener("click", (function(credential) {
            return function(evt) {
                setCredentialToForm(credential);
                chrome.storage.local.get("keptCredentials", function(items) {
                    var credentials = items.keptCredentials || {};
                    var key = createKey(credential.serverName, credential.serverPort, credential.username);
                    delete credentials[key];
                    chrome.storage.local.set({
                        keptCredentials: credentials
                    }, function() {
                        loadKeptCredentials();
                    });
                });
            };
        })(credential));
        div.appendChild(btnClose);
        credentials.appendChild(div);
    };

    var setCredentialToForm = function(credential) {
        document.querySelector("#serverName").value = credential.serverName;
        document.querySelector("#serverPort").value = credential.serverPort;
        document.querySelector("#username").value = credential.username;
        var password = credential.password;
        if (password) {
            document.querySelector("#password").value = password;
        } else {
            document.querySelector("#password").value = "";
        }
        document.querySelector("#domainName").value = credential.domainName;
        document.querySelector("#password").focus();
    };

    var createKey = function(serverName, serverPort, username) {
        return serverName + ":" + serverPort + " (" + username + ")";
    };

    var onClickedBtnSettings = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var keepPassword = settings.keepPassword || "keepPasswordNo";
            if (keepPassword === "keepPasswordYes") {
                document.querySelector("#keepPassword").selected = "keepPasswordYes";
            } else {
                document.querySelector("#keepPassword").selected = "keepPasswordNo";
            }
            /*
            var debugLevel = settings.debugLevel;
            if (typeof debugLevel === "undefined") {
                debugLevel = 2;
            }
            if (debugLevel === 0) {
                document.querySelector("#debugLevel").selected = "debugLevelTrace";
            } else if (debugLevel === 1) {
                document.querySelector("#debugLevel").selected = "debugLevelInfo";
            } else {
                document.querySelector("#debugLevel").selected = "debugLevelError";
            }
            */
            document.querySelector("#settingsDialog").toggle();
        });
    };

    var onChangeKeepPassword = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            settings.keepPassword = document.querySelector("#keepPassword").selected;
            chrome.storage.local.set({settings: settings}, function() {
                console.log("Saving settings done.");
            });
        });
    };

    var onChangeDebugLevel = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var debugLevelName = document.querySelector("#debugLevel").selected;
            if (debugLevelName === "debugLevelTrace") {
                settings.debugLevel = 0;
            } else if (debugLevelName === "debugLevelInfo") {
                settings.debugLevel = 1;
            } else {
                settings.debugLevel = 2;
            }
            chrome.storage.local.set({settings: settings}, function() {
                console.log("Saving settings done.");
                var request = {
                    type: "refreshDebugLevel"
                };
                chrome.runtime.sendMessage(request);
            });
        });
    };

    window.addEventListener("load", function(e) {
        onLoad();
    });

    setMessageResources();

})();
