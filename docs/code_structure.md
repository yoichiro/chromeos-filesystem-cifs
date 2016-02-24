# Code Structure

This document describes you code structure of this software. Mainly, I write down about the directory structure and the purpose of each file.

# Directory

* [/](https://github.com/yoichiro/chromeos-filesystem-cifs) - Build files, Configuration files, and etc.
* [/app](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/app) - This directory has one HTML file and the manifest.json file.
* [/app/_locales/en](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/app/_locales/en) - There is one message resource file for English.
* [/app/icons](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/app.icons) - This directory has some image files.
* [/app/scripts](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/app/scripts) - There are all JavaScript files.
* [/app/styles](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/app/styles) - There is one css style sheet definition file.
* [/test](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/test) - Currently, all files are garbage...
* [/docs](https://github.com/yoichiro/chromeos-filesystem-cifs/tree/master/docs) - Currently, there is one image file which is referenced by the README.md file.

At least, if you are a programmer, first you should enter the /app/scripts directory and see each JavaScript files to understand this app's behaviors.

# Files

## For Building

### [/Gruntfile.js](https://github.com/yoichiro/chromeos-filesystem-cifs/blob/master/Gruntfile.js)

This file defines all procedures to build this software with [grunt](http://gruntjs.com/).

### [/package.json](https://github.com/yoichiro/chromeos-filesystem-cifs/blob/master/package.json)

The building procedures are using many sub tasks for the grunt. This file defines the used sub tasks.

### [/bower.js](https://github.com/yoichiro/chromeos-filesystem-cifs/blob/master/bower.js)

This software is using [bower](http://bower.io/) to manage packages. This software is using [Polymer 0.5](https://www.polymer-project.org/0.5/), and this file defines each polymer components as depended packages.

### [/.jshintrc](https://github.com/yoichiro/chromeos-filesystem-cifs/blob/master/.jshintrc)

[JSHint](http://jshint.com/) is a software to check the JavaScript Code as a static code analyzing. This file defines each check rule. That is, this file has many flags to turn on/off each checking process. JSHint is executed by the grunt tool automatically, because the Gruntfile.js has the task to execute the JSHint.

## HTML

### [/app/window.html](https://github.com/yoichiro/chromeos-filesystem-cifs/blob/master/app/window.html)

This HTML file provides a screen to fill in a connection information. The connection information form consists of server host-name, the port number, user name, user password, the domain name, the shared resource name the user wants to mount and the root directory. When the user pushes the "KEEP" button, the connection information the user filled in is stored to the shared storage with [chrome.storage.local](https://developer.chrome.com/apps/storage#property-local) API. All stored information are displayed on the left pane.

This HTML elements consists of Polymer components. Each click event is handled by the function defined by /app/scripts/window.js file.

This window.html file has three dialogs.

#### Setting Dialog

First dialog is for setting some configurations. Actually, this dialog is the element which has the "settingsDialog" ID value. The configuration items are:

* Turn on/off whether keep the password the user filled in or not.
* Select the debug level from "Trace", "Info" and "Error".
* Select the max version of the SMB protocol from either 1 or 2.
* Select the LMCompatibilityLevel value between 0 and 5.

#### Shared Resource List Dialog

After authenticating the user, this software gets the shared resource list from the server, if the user didn't fill in the shared resource name on the window.html screen. Then, the Shared Resource List Dialog is opened, and the shared resource list is displayed on the dialog. The user has to select one shared resource and to click the "Connect" button.

#### Service List Dialog

In the background context, it handles the multi-cast DNS (mDNS) event regarding SMB servers with the chrome.mdns API. This Service List dialog shows the user the retrieved server list. If the user selects one server from the list, the server name is set into the connection information form.
