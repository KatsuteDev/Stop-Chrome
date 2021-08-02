/*
 * Copyright (C) 2021 Katsute
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import { app, dialog, Menu, nativeImage, Notification, Tray } from "electron";

// @ts-ignore (no types available)
import { snapshot } from "process-list";

import path from "path";

type task = {

    name: string;
    pid: number;
    ppid: number;

}

// ----- main ---------------

const name: string = "Chrome Can You Not"

const icon: string = path.join(__dirname, "../", "icon.png");
const green: string = path.join(__dirname, "../", "state_green.png");
const red: string = path.join(__dirname, "../", "state_red.png");

abstract class Main {

    public static tray: Tray;
    private static menu: Menu;

    private static chromeProcessID: number | null = null;

    public static async main(): Promise<void> {
        if(require('electron-squirrel-startup') || !app.requestSingleInstanceLock())
            return app.quit();

        app.once("ready", (event: Electron.Event, launchInfo: Record<string,any> | Electron.NotificationResponse) => {
            Main.tray = new Tray(green);
            Main.tray.setToolTip(name);
            Main.tray.setImage(icon);
            Main.tray.setContextMenu(Main.menu = Menu.buildFromTemplate([
                {
                    label: name,
                    type: "normal",
                    icon: nativeImage.createFromPath(icon).resize({width: 16, height: 16}),
                    enabled: false
                },
                {
                    type: "separator"
                },
                {
                    id: "chrome",
                    label: "Stop Chrome",
                    type: "normal",
                    enabled: false,
                    click: Main.endChromeProcess
                },
                {
                    type: "separator"
                },
                {
                    id: "quit",
                    label: "Quit",
                    type: "normal",
                    click: () => {
                        Main.tray.destroy();
                        app.quit();
                        process.exit(0);
                    }
                }
            ]));

            new Notification({
                title: name,
                body: `${name} is now running. Right click the tray icon to access options.`,
                icon
            }).show();

            Main.checkChromeProcess();
            setInterval(Main.checkChromeProcess, 10 * 1000); // poll every 10 seconds
        });

    }

    private static checkChromeProcess(): void {
        snapshot("name", "pid", "ppid").then((tasks: any[]) => {
            let chromeParentProcessID: number | null = null;
            for(const task of (tasks as task[])){
                if(task.name == "chrome.exe"){ // find chrome subprocess
                    const parentProcess: task | null = Main.getProcess(tasks as task[], task.ppid);
                    if(parentProcess && parentProcess.name == "chrome.exe"){ // find chrome parent process
                        chromeParentProcessID = task.ppid;
                        break;
                    }
                }
            }
            Main.chromeProcessID = chromeParentProcessID;

            // change icon and toggle kill switch
            Main.menu.getMenuItemById("chrome")!.enabled = !!chromeParentProcessID;
            Main.tray.setToolTip(chromeParentProcessID ? "Chrome is running" : "Chrome is not running");
            Main.tray.setImage(chromeParentProcessID ? red : green);
        });
    }

    private static endChromeProcess(): void {
        if(Main.chromeProcessID){
            const index = dialog.showMessageBoxSync({
                title: name,
                message: "Are you sure you want to stop chrome?",
                type: "warning",
                buttons: ["Yes", "No"],
                defaultId: 1,
                cancelId: 1,
                noLink: true // force Electron to use above options
            });

            if(index == 0)// [Yes]
                process.kill(Main.chromeProcessID);
        }

        Main.checkChromeProcess();
    }

    private static getProcess(processes: task[], pid: number): task | null {
        for(const process of processes)
            if(process.pid == pid)
                return process;
        return null;
    }

}

process.on("unhandledRejection", (error: Error, promise) => {
    console.error(`Unhandled rejection at:\n  Promise ${promise}\n  ${error.stack}`);
    if(app){
        if(Main.tray)
            Main.tray.destroy();
        app.quit();
    }
});

Main.main().catch((error: Error) => {
    console.error(error.stack);
    if(app){
        if(Main.tray)
            Main.tray.destroy();
        app.quit();
    }
});