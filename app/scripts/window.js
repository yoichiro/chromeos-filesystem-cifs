"use strict";

(function() {

    var onLoad = function() {
        loadKeptCredentials();
        assignEventHandlers();
        changeRootDirectoryEnabled();
        showSeasonImage();
    };

    var showSeasonImage = function() {
        var today = new Date();
        var month = today.getMonth() + 1;
        var date = today.getDate();
        // Xmas
        if (month === 12 && (1 <= date && date <= 25)) {
            var img = document.createElement("img");
            img.src = "icons/xmas.png";
            img.classList.add("season");
            var logo = document.querySelector("#logo");
            img.style.top = logo.getBoundingClientRect().top + "px";
            img.style.left = (logo.getBoundingClientRect().left + 24) + "px";
            var body = document.querySelector("body");
            body.appendChild(img);
        }
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
        var sharedResourceName = document.querySelector("#sharedResourceName");
        sharedResourceName.addEventListener("keyup", function(e) {
            onKeyupSharedResourceName(e);
        });
        // Settings dialog
        var btnSettings = document.querySelector("#btnSettings");
        btnSettings.addEventListener("click", function(e) {
            onClickedBtnSettings(e);
        });
        var keepPasswordYes = document.querySelector("#keepPasswordYes");
        keepPasswordYes.addEventListener("click", onChangeKeepPassword);
        var keepPasswordNo = document.querySelector("#keepPasswordNo");
        keepPasswordNo.addEventListener("click", onChangeKeepPassword);

        var debugLevelTrace = document.querySelector("#debugLevelTrace");
        debugLevelTrace.addEventListener("click", onChangeDebugLevel);
        var debugLevelInfo = document.querySelector("#debugLevelInfo");
        debugLevelInfo.addEventListener("click", onChangeDebugLevel);
        var debugLevelError = document.querySelector("#debugLevelError");
        debugLevelError.addEventListener("click", onChangeDebugLevel);

        var maxProtocolVersionSmb1 = document.querySelector("#maxProtocolVersionSmb1");
        maxProtocolVersionSmb1.addEventListener("click", onChangeMaxProtocolVersion);
        var maxProtocolVersionSmb2 = document.querySelector("#maxProtocolVersionSmb2");
        maxProtocolVersionSmb2.addEventListener("click", onChangeMaxProtocolVersion);

        var lmCompatibilityLevel = document.querySelector("#lmCompatibilityLevel");
        lmCompatibilityLevel.addEventListener("change", onSelectLmCompatibilityLevel);

        // Search dialog
        var btnSearch = document.querySelector("#btnSearch");
        btnSearch.addEventListener("click", function(e) {
            onClickedBtnSearch(e);
        });
        var btnSelectServer = document.querySelector("#btnSelectServer");
        btnSelectServer.addEventListener("click", function(e) {
            onClickedBtnSelectServer(e);
        });
    };

    var onClickedBtnMount = function(evt) {
        console.log("onClickedBtnMount");
        var btnMount = document.querySelector("#btnMount");
        evt.preventDefault();
        btnMount.setAttribute("disabled", "true");
        $.toaster({message: chrome.i18n.getMessage("mountAttempt")});
        var request = {
            serverName: document.querySelector("#serverName").value,
            serverPort: document.querySelector("#serverPort").value,
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value,
            domainName: document.querySelector("#domainName").value
        };
        var sharedResourceName = document.querySelector("#sharedResourceName").value;
        if (sharedResourceName) {
            request.type = "mount";
            request.sharedResource = sharedResourceName;
            var rootDirectory = document.querySelector("#rootDirectory").value;
            if (rootDirectory) {
                request.rootDirectory = rootDirectory;
            }
        } else {
            request.type = "getSharedResources";
        }
        chrome.runtime.sendMessage(request, function(response) {
            console.log(response);
            // var toast = document.getElementById("toast-mount-fail");
            if (response.type === "sharedResources") {
                var sharedResources = document.querySelector("#sharedResources");
                sharedResources.innerHTML = "";
                for (var i = 0; i < response.sharedResources.length; i++) {
                    var div = document.createElement("div");
                    div.setAttribute("class", "radio");
                    var label = document.createElement("label");
                    var radio = document.createElement("input");
                    radio.name = "sharedResource";
                    radio.value = response.sharedResources[i].name;
                    radio.type = "radio";
                    if (i == 0) {
                      radio.checked = true;
                    }
                    label.appendChild(radio);
                    var text = response.sharedResources[i].name;
                    label.appendChild(document.createTextNode(text));
                    div.appendChild(label);
                    sharedResources.appendChild(div);
                }
                $("#selectSharedResourceDialog").modal("show");
            } else if (response.type === "mount") {
                if (response.success) {
                    $.toaster({message: chrome.i18n.getMessage("mountSuccess")});
                    window.setTimeout(function() {
                        window.close();
                    }, 2000);
                } else {
                    var msg = {
                      title: chrome.i18n.getMessage("mountFail"),
                      priority: "danger",
                      message: "Something wrong"
                    };
                    if (response.error) {
                        msg.message = response.error;
                    }
                    $.toaster(msg);
                    btnMount.removeAttribute("disabled");
                }
            } else {
                var msg = {
                  title: chrome.i18n.getMessage("mountFail"),
                  priority: "danger",
                  message: "Something wrong"
                };
                if (response.error) {
                  msg.message = response.error;
                }
                $.toaster(msg);
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
        var sharedResource = document.forms.selectSharedResourceForm.sharedResource.value;
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
            if (response && response.success) {
                $.toaster({message: chrome.i18n.getMessage("mountSuccess")});
                window.setTimeout(function() {
                    window.close();
                }, 2000);
            } else {
                var msg = {
                  title: chrome.i18n.getMessage("mountFail"),
                  priority: "danger",
                  message: "Something wrong"
                };
                if (response && response.error) {
                  msg.message = response.error;
                }
                $.toaster(msg);
                $("#selectSharedResourceDialog").modal("hide");
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

    var onKeyupSharedResourceName = function(evt) {
        changeRootDirectoryEnabled();
    };

    var changeRootDirectoryEnabled = function() {
        var rootDirectory = document.querySelector("#rootDirectory");
        var sharedResourceName = document.querySelector("#sharedResourceName");
        if (sharedResourceName.value) {
            rootDirectory.removeAttribute("disabled");
        } else {
            rootDirectory.setAttribute("disabled", "true");
        }
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
            case "button":
                textNode = document.createTextNode(messageText);
                element.appendChild(textNode);
                break;
            case "input":
                element.setAttribute("placeholder", messageText);
                break;
            case "h2":
            case "title":
            case "label":
                textNode = document.createTextNode(messageText);
                element.appendChild(textNode);
                break;
            }
        }
    };

    var onClickedBtnKeep = function(evt) {
        console.log("onClickedBtnKeep");
        evt.preventDefault();
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var keepPassword = settings.keepPassword || "keepPasswordNo";
            keepPassword = (keepPassword === "keepPasswordYes");
            var serverName = document.querySelector("#serverName").value;
            var serverPort = document.querySelector("#serverPort").value;
            var username = document.querySelector("#username").value;
            var password = document.querySelector("#password").value;
            var domainName = document.querySelector("#domainName").value;
            var sharedResourceName = document.querySelector("#sharedResourceName").value;
            var rootDirectory = document.querySelector("#rootDirectory").value;
            if (serverName && serverPort) {
                chrome.storage.local.get("keptCredentials", function(items) {
                    var credentials = items.keptCredentials || {};
                    var key = createKey(serverName, serverPort, username, domainName);
                    var credential = {
                        serverName: serverName,
                        serverPort: serverPort,
                        username: username,
                        domainName: domainName,
                        sharedResourceName: sharedResourceName,
                        rootDirectory: rootDirectory
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
        div.setAttribute("class", "credential");
        var credentialInfo = document.createElement("div");
        credentialInfo.setAttribute("class", "pull-left credential-info");
        credentialInfo.textContent = createKey(
            credential.serverName, credential.serverPort, credential.username, credential.domainName);
        credentialInfo.addEventListener("click", (function(credential) {
            return function(evt) {
                setCredentialToForm(credential);
            };
        })(credential));
        div.appendChild(credentialInfo);
        var divBtn = document.createElement("div");
        divBtn.setAttribute("class", "pull-right");
        var btnClose = document.createElement("div");
        btnClose.setAttribute("class", "glyphicon glyphicon-remove btn-credential-remove");
        btnClose.setAttribute("aria-hidden", "true");
        btnClose.addEventListener("click", (function(credential) {
            return function(evt) {
                setCredentialToForm(credential);
                chrome.storage.local.get("keptCredentials", function(items) {
                    var credentials = items.keptCredentials || {};
                    var key = createKey(
                        credential.serverName, credential.serverPort, credential.username, credential.domainName);
                    delete credentials[key];
                    chrome.storage.local.set({
                        keptCredentials: credentials
                    }, function() {
                        loadKeptCredentials();
                    });
                });
            };
        })(credential));
        divBtn.appendChild(btnClose);
        div.appendChild(divBtn);
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
        document.querySelector("#sharedResourceName").value = credential.sharedResourceName;
        document.querySelector("#rootDirectory").value = credential.rootDirectory;
        changeRootDirectoryEnabled();
        document.querySelector("#password").focus();
    };

    var createKey = function(serverName, serverPort, username, domainName) {
        if (username) {
            if (domainName) {
                return serverName + ":" + serverPort + " (" + domainName + "@" + username + ")";
            } else {
                return serverName + ":" + serverPort + " (" + username + ")";
            }
        } else {
            return serverName + ":" + serverPort;
        }
    };

    var onClickedBtnSettings = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var keepPassword = settings.keepPassword || "keepPasswordNo";
            if (keepPassword === "keepPasswordYes") {
                document.querySelector("#keepPasswordYes").checked = true;
            } else {
                document.querySelector("#keepPasswordNo").checked = true;
            }

            var debugLevel = settings.debugLevel;
            if (typeof debugLevel === "undefined") {
                debugLevel = 1;
            }
            if (debugLevel === 0) {
                document.querySelector("#debugLevelTrace").checked = true;
            } else if (debugLevel === 1) {
                document.querySelector("#debugLevelInfo").checked = true;
            } else {
                document.querySelector("#debugLevelError").checked = true;
            }

            var maxProtocolVersion = settings.maxProtocolVersion;
            if (typeof maxProtocolVersion === "undefined") {
                maxProtocolVersion = 2;
            }
            if (maxProtocolVersion === 1) {
                document.querySelector("#maxProtocolVersionSmb1").checked = true;
            } else if (maxProtocolVersion === 2) {
                document.querySelector("#maxProtocolVersionSmb2").checked = true;
            } else {
                document.querySelector("#maxProtocolVersionSmb2").checked = true;
            }

            var lmCompatibilityLevel = settings.lmCompatibilityLevel;
            if (typeof lmCompatibilityLevel === "undefined") {
                lmCompatibilityLevel = 5;
            }
            document.querySelector("#lmCompatibilityLevel").value = lmCompatibilityLevel;

            $("#settingsDialog").modal("show");
        });
    };

    var onChangeKeepPassword = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            if (document.querySelector("#keepPasswordYes").checked) {
              settings.keepPassword = "keepPasswordYes";
            } else {
              settings.keepPassword = "keepPasswordNo";
            }
            chrome.storage.local.set({settings: settings}, function() {
                console.log("Saving settings done.");
            });
        });
    };

    var onChangeDebugLevel = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            if (document.querySelector("#debugLevelTrace").checked) {
                settings.debugLevel = 0;
            } else if (document.querySelector("#debugLevelInfo").checked) {
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

    var onChangeMaxProtocolVersion = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            if (document.querySelector("#maxProtocolVersionSmb1").checked) {
                settings.maxProtocolVersion = 1;
            } else if (document.querySelector("#maxProtocolVersionSmb2").checked) {
                settings.maxProtocolVersion = 2;
            } else {
                settings.maxProtocolVersion = 2;
            }
            chrome.storage.local.set({settings: settings}, function() {
                console.log("Saving settings done.");
            });
        });
    };

    var onSelectLmCompatibilityLevel = function(evt) {
        chrome.storage.local.get("settings", function(items) {
            var settings = items.settings || {};
            var lmCompatibilityLevel = document.querySelector("#lmCompatibilityLevel").value;
            settings.lmCompatibilityLevel = Number(lmCompatibilityLevel);
            chrome.storage.local.set({settings: settings}, function() {
                console.log("Saving settings done.");
            });
        });
    };

    var onClickedBtnSearch = function(evt) {
        console.log("onClickedBtnSearch");
        var request = {
            type: "lookupServiceList"
        };
        chrome.runtime.sendMessage(request, function(response) {
            var serviceList = response.serviceList;

            var serviceListElem = document.querySelector("#serviceList");
            serviceListElem.innerHTML = "";
            for (var i = 0; i < serviceList.length; i++) {
                var div = document.createElement("div");
                div.setAttribute("class", "radio");
                var label = document.createElement("label");
                var radio = document.createElement("input");
                radio.name = "service";
                radio.value = createServiceName(serviceList[i]);
                radio.type = "radio";
                if (i == 0) {
                  radio.checked = true;
                }
                label.appendChild(radio);
                var text = serviceList[i].serviceName.substring(0, serviceList[i].serviceName.indexOf("."));
                label.appendChild(document.createTextNode(text));
                div.appendChild(label);
                serviceListElem.appendChild(div);
            }

            $("#serviceListDialog").modal("show");
        });
    };

    var createServiceName = function(service) {
        return service.ipAddress + "_" + service.serviceHostPort.substring(service.serviceHostPort.indexOf(":") + 1);
    };

    var onClickedBtnSelectServer = function(evt) {
        console.log("onClickedBtnSelectServer");
        var selectedServiceName = document.forms.serviceListForm.service.value;
        if (selectedServiceName) {
            var ipAddress = selectedServiceName.substring(0, selectedServiceName.indexOf("_"));
            var port = selectedServiceName.substring(selectedServiceName.indexOf("_") + 1);
            document.querySelector("#serverName").value = ipAddress;
            document.querySelector("#serverPort").value = port;
            document.querySelector("#username").focus();
        }
      $("#serviceListDialog").modal("hide");
    };

    window.addEventListener("load", function(e) {
        onLoad();
    });

    setMessageResources();

})();
