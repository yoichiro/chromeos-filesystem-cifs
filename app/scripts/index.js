"use strict";
document.addEventListener("DOMContentLoaded", function() {
    var h1 = document.getElementsByTagName("h1");
    if (h1.length > 0) {
        h1[0].innerText = h1[0].innerText + " \"Allo";
    }
}, false);

(function() {

    var client = null;

    var assignEventHandlers = function() {
        document.querySelector("#testAuth").addEventListener("click", function(evt) {
            onClickedTestAuth();
        });
        document.querySelector("#login").addEventListener("click", function(evt) {
            onClickedLogin();
        });
        document.querySelector("#getSharedResources").addEventListener("click", function(evt) {
            onClickedGetSharedResources();
        });
        document.querySelector("#connectSharedResource").addEventListener("click", function(evt) {
            onClickedConnectSharedResource();
        });
        document.querySelector("#getMetadata").addEventListener("click", function(evt) {
            onClickedGetMetadata();
        });
        document.querySelector("#readDirectory").addEventListener("click", function(evt) {
            onClickedReadDirectory();
        });
        document.querySelector("#readFile").addEventListener("click", function(evt) {
            onClickedReadFile();
        });
        document.querySelector("#createFile").addEventListener("click", function(evt) {
            onClickedCreateFile();
        });
        document.querySelector("#truncateFile").addEventListener("click", function(evt) {
            onClickedTruncateFile();
        });
        document.querySelector("#writeFile").addEventListener("click", function(evt) {
            onClickedWriteFile();
        });
        document.querySelector("#createDirectory").addEventListener("click", function(evt) {
            onClickedCreateDirectory();
        });
        document.querySelector("#deleteFile").addEventListener("click", function(evt) {
            onClickedDeleteFile();
        });
        document.querySelector("#deleteDirectory").addEventListener("click", function(evt) {
            onClickedDeleteDirectory();
        });
        document.querySelector("#moveDirectory").addEventListener("click", function(evt) {
            onClickedMoveDirectory();
        });
        document.querySelector("#copyDirectory").addEventListener("click", function(evt) {
            onClickedCopyDirectory();
        });
        document.querySelector("#moveFile").addEventListener("click", function(evt) {
            onClickedMoveFile();
        });
        document.querySelector("#copyFile").addEventListener("click", function(evt) {
            onClickedCopyFile();
        });
        document.querySelector("#renameFile").addEventListener("click", function(evt) {
            onClickedRenameFile();
        });
    };

    var onClickedTestAuth = function() {
        console.log("LM Hash & LM Reponse");
        var lmHash = new SmbClient.LmHash();
        var hash = lmHash.create("SecREt01");
        _outputArrayBuffer(hash);
        var lmResponse = new SmbClient.LmResponse();
        var serverChallenge = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
        var response = lmResponse.create(hash, serverChallenge);
        _outputArrayBuffer(response);

        console.log("NTLM Hash & NTLM Reponse");
        var ntlmHash = new SmbClient.NtlmHash();
        hash = ntlmHash.create("SecREt01");
        _outputArrayBuffer(hash);
        lmResponse = new SmbClient.LmResponse();
        serverChallenge = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
        response = lmResponse.create(hash, serverChallenge);
        _outputArrayBuffer(response);

        console.log("NTLMv2 Hash & NTLMv2 Reponse");
        var ntlmV2Hash = new SmbClient.NtlmV2Hash();
        hash = ntlmV2Hash.create("user", "SecREt01", "DOMAIN");
        _outputArrayBuffer(hash);
        var ntlmV2Response = new SmbClient.NtlmV2Response();
        serverChallenge = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
        var targetInformation = new Uint8Array(
            [0x02, 0x00, 0x0c, 0x00, 0x44, 0x00, 0x4f, 0x00,
             0x4d, 0x00, 0x41, 0x00, 0x49, 0x00, 0x4e, 0x00,
             0x01, 0x00, 0x0c, 0x00, 0x53, 0x00, 0x45, 0x00,
             0x52, 0x00, 0x56, 0x00, 0x45, 0x00, 0x52, 0x00,
             0x04, 0x00, 0x14, 0x00, 0x64, 0x00, 0x6f, 0x00,
             0x6d, 0x00, 0x61, 0x00, 0x69, 0x00, 0x6e, 0x00,
             0x2e, 0x00, 0x63, 0x00, 0x6f, 0x00, 0x6d, 0x00,
             0x03, 0x00, 0x22, 0x00, 0x73, 0x00, 0x65, 0x00,
             0x72, 0x00, 0x76, 0x00, 0x65, 0x00, 0x72, 0x00,
             0x2e, 0x00, 0x64, 0x00, 0x6f, 0x00, 0x6d, 0x00,
             0x61, 0x00, 0x69, 0x00, 0x6e, 0x00, 0x2e, 0x00,
             0x63, 0x00, 0x6f, 0x00, 0x6d, 0x00, 0x00, 0x00,
             0x00, 0x00]
        );
        response = ntlmV2Response.create(hash, serverChallenge, targetInformation);
        _outputArrayBuffer(response);

        console.log("LMv2 Hash & LMv2 Reponse");
        ntlmV2Hash = new SmbClient.NtlmV2Hash();
        hash = ntlmV2Hash.create("user", "SecREt01", "DOMAIN");
        _outputArrayBuffer(hash);
        var lmV2Response = new SmbClient.LmV2Response();
        serverChallenge = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
        response = lmV2Response.create(hash, serverChallenge);
        _outputArrayBuffer(response);

        console.log("NTLMv2 Session Response");
        var ntlmV2SessionResponse = new SmbClient.NtlmV2SessionResponse();
        serverChallenge = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
        response = ntlmV2SessionResponse.create("SecREt01", serverChallenge);
        _outputArrayBuffer(response.lmResponse);
        _outputArrayBuffer(response.ntlmResponse);
    };

    var msg = function(message) {
        document.querySelector("#msg").textContent = message;
    };

    var onClickedLogin = function() {
        client = new SmbClient.Client();
        var serverName = "10.211.55.4";
        //var serverName = "192.168.147.131";
        //var serverName = "10.211.55.3";
        //var serverName = "freenas.eisbahn.jp";
        var userName = "yoichiro";
        var password = document.querySelector("#password").value;
        client.login(serverName, userName, password, function() {
            msg("Logged in");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedGetSharedResources = function() {
        client.getSharedResourceList(function(netShareEnums) {
            msg(JSON.stringify(netShareEnums));
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedConnectSharedResource = function() {
        client.connectSharedResource("yoichiro", function() {
        //client.connectSharedResource("share", function() {
            msg("Connected");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedGetMetadata = function() {
        //client.getMetadata("\\45f5795b.jpg", function(file) {
        //client.getMetadata("\\Documents\\hello.txt", function(file) {
        client.getMetadata("\\Pictures\\aaa.jpg", function(file) {
        //client.getMetadata("\\", function(file) {
            msg(JSON.stringify(file));
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedReadDirectory = function() {
        client.readDirectory("\\", function(files) {
        //client.readDirectory("\\Pictures", function(files) {
        //client.readDirectory("\\private\\movies", function(files) {
            msg(JSON.stringify(files));
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedReadFile = function() {
        //client.readFile("\\Videos\\wanwan.mp4", 0, 3102541, function(buffer) {
        //client.readFile("\\Pictures\\aaa.jpg", 0, 197884, function(buffer) {
        //client.readFile("\\Documents\\hello.txt", 0, 500, function(buffer) {
        client.readFile("\\private\\movies\\HD\\0897793.mp4", 0, 50000000, function(buffer) {
            msg(buffer.byteLength);
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedCreateFile = function() {
        client.createFile("\\Documents\\test.txt", function() {
            msg("Created");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedTruncateFile = function() {
        client.truncate("\\Documents\\test.txt", 100, function() {
            msg("Truncated");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedWriteFile = function() {
        var buffer = new ArrayBuffer(8192 * 5);
        var array = new Uint8Array(buffer);
        for (var i = 0; i < 8192 * 5; i++) {
            array[i] = 0x30 + (i % 10);
        }
        client.writeFile("\\Documents\\test.txt", 0, array, function() {
            msg("Wrote");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedCreateDirectory = function() {
        client.createDirectory("\\Documents\\foobar", function() {
            msg("Created");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedDeleteFile = function() {
        client.deleteEntry("\\Documents\\delete.txt", function() {
            msg("Deleted");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedDeleteDirectory = function() {
        client.deleteEntry("\\Music\\foo", function() {
            msg("Deleted");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedMoveDirectory = function() {
        client.move("\\Documents\\foo", "\\Music\\foo", function() {
            msg("Moved");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedCopyDirectory = function() {
        client.copy("\\Documents\\foo", "\\Music\\foo", function() {
            msg("Copied");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedMoveFile = function() {
        client.move("\\Documents\\hello.txt", "\\Music\\hello.txt", function() {
            msg("Moved");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedCopyFile = function() {
        client.copy("\\Documents\\hello.txt", "\\Music\\hello.txt", function() {
            msg("Copied");
        }, function(error) {
            console.log(error);
        });
    };

    var onClickedRenameFile = function() {
        client.move("\\Documents\\hello.txt", "\\Documents\\hello2.txt", function() {
            msg("Renamed");
        }, function(error) {
            console.log(error);
        });
    };

    var _outputArrayBuffer = function(buffer) {
        var array = new Uint8Array(buffer);
        var out = "";
        for (var i = 0; i < array.length; i++) {
            // out += String.fromCharCode(array[i]);
            out += (new Number(array[i])).toString(16).toUpperCase() + " ";
        }
        console.log(out);
    };

    window.addEventListener("load", function(evt) {
        assignEventHandlers();
    });
})();
