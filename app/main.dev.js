/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {app, BrowserWindow, ipcMain, ipcRenderer} from "electron";
import {autoUpdater} from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import download from "download";
import fs from "fs";
import {showLog} from "./utils/Utils";

export default class AppUpdater {
    constructor() {
        log.transports.file.level = "info";
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow = null;

if (process.env.NODE_ENV === "production") {
    const sourceMapSupport = require("source-map-support");
    sourceMapSupport.install();
}

if (process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true") {
    require("electron-debug")();
}

const installExtensions = async () => {
    const installer = require("electron-devtools-installer");
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

    return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload))).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("ready", async () => {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true") {
        await installExtensions();
    }

    mainWindow = new BrowserWindow({show: false, width: 1024, height: 728});

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on("did-finish-load", () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    ipcMain.on("downloadFiles", (e, args) => {
        let totalCount = args.files.length;
        console.log("Instant download started for " + totalCount + " files");
        let files = [];
        let pass = [];
        let fail = [];
        args.files.forEach((file, index) => {
            if (file.url !== "") {
                files.push(downloadFile(file.url, file.dirPath, index).then(result => {
                    pass.push(result);
                    let count = (pass.length/totalCount)*100;
                    let completion = Number.parseFloat(count).toFixed(2)
                    let totalProcessed = Number.parseFloat(((pass.length + fail.length)/totalCount)*100).toFixed(2);
                    showLog(`Passed: (${pass.length}/${totalCount})*100 = ${completion}`);
                    if(completion%5 > 0 && completion%5 < 1){
                        sendProgressResponse(e, {"type": "passed", "value": completion, 'processed': totalProcessed});
                    }
                }).catch(error => {
                    fail.push(error);
                    let count = (fail.length/totalCount)*100;
                    let failed = Number.parseFloat(count).toFixed(2)
                    let totalProcessed = Number.parseFloat(((pass.length + fail.length)/totalCount)*100).toFixed(2);
                    showLog(`Failed: (${fail.length}/${totalCount})*100 = ${failed}`);
                    if(failed%5 > 0 && failed%5 < 1){
                        sendProgressResponse(e, {"type": "failed", "value": failed, 'processed': totalProcessed});
                    }
                }));
            } else {
                fail.push(index);
                let count = (fail.length/totalCount)*100;
                let failed = Number.parseFloat(count).toFixed(2)
                let totalProcessed = Number.parseFloat(((pass.length + fail.length)/totalCount)*100).toFixed(2);
                showLog(`Failed: (${fail.length}/${totalCount})*100 = ${failed}`);
                if(failed%5 > 0 && failed%5 < 1){
                    sendProgressResponse(e, {"type": "failed", "value": failed, 'processed': totalProcessed});
                }
            }
        });
        Promise.all(files).then(result => {
            console.log("All files downloaded and count is " + files.length);
            let passed = Math.round((pass.length/totalCount)*100);
            let failed = Math.round((fail.length/totalCount)*100);
            let totalProcessed = passed+failed;
            let output = {
                pass,
                fail,
                passed,
                failed,
                'processed': totalProcessed
            };
            sendResponse(e, output);
        });
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
});

function sendResponse(e, result) {
    e.sender.send("rv911-done", result);
}

function sendProgressResponse(e, result) {
    console.log(result);
    e.sender.send("rv911-progress", result);
}

const downloadFile = (url, path, index) => {
    return new Promise((resolve, reject) => {
        let dirPath = app.getPath("pictures") + path;
        download(url, dirPath).then(data => {
            //console.log(index + ". " + url);
            resolve(index);
        }).catch(error => {
            //console.log(index + ". Error: " + url);
            console.log(error);
            reject(index);
        });
    });
};
