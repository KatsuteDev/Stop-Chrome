/*
 * Copyright (C) 2021-2022 Katsute
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

import { app, dialog, Menu, nativeImage, Tray } from "electron";

import { exec } from 'child_process';
import path from "path";

type process = {

    name: string;
    pid: number;
    ppid: number;

}

// ----- main ---------------

const name: string = "Stop Chrome";
const version: string = "2.0.1";

const icon : string = path.join(__dirname, "../", "icon.png");
const green: string = path.join(__dirname, "../", "state_green.png");
const red  : string = path.join(__dirname, "../", "state_red.png");

abstract class Main {

    public static tray: Tray;
    private static menu: Menu;

    private static chromePID: number | null = null;

    public static async main(): Promise<void> {
        if(require('electron-squirrel-startup') || !app.requestSingleInstanceLock())
            return app.quit();

        app.once("ready", () => {
            Main.tray = new Tray(green);
            Main.tray.setToolTip(name);
            Main.tray.setImage(icon);
            Main.tray.on("click", () => Main.tray.popUpContextMenu());
            Main.tray.setContextMenu(Main.menu = Menu.buildFromTemplate([
                {
                    label: `${name} v${version}`,
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

            Main.checkChromeProcess();
            setInterval(Main.checkChromeProcess, 10 * 1000); // poll every 10 seconds
        });

    }

    private static isChecking: boolean = false;

    private static checkChromeProcess(): void {
        if(this.isChecking)
            return;
        else
            this.isChecking = true;

        Main.lookup()
            .then(processes => {
                let chromePID: number | null = null;
                for(const process of processes){
                    if(process.name == "chrome.exe"){ // verify process is chrome
                        const parentProcess: process | null = Main.find(processes, process.ppid);
                        if(parentProcess && parentProcess.name == "chrome.exe"){ // reverify parent is chrome
                            chromePID = parentProcess.pid;
                            break;
                        }
                    }
                }
                Main.chromePID = chromePID;

                // change icon and toggle kill switch
                Main.menu.getMenuItemById("chrome")!.enabled = !!chromePID;
                Main.tray.setToolTip(`Chrome is${chromePID ? "" : " not"} running`);
                Main.tray.setImage(chromePID ? red : green);
            })
            .finally(() => {
                this.isChecking = false;
            });
    }

    private static endChromeProcess(): void {
        if(Main.chromePID){
            const index = dialog.showMessageBoxSync({
                title: name,
                message: "Are you sure you want to stop chrome?",
                type: "warning",
                buttons: ["Yes", "No"],
                defaultId: 1,
                cancelId: 1,
                noLink: true // force Electron to use above options
            });

            if(index == 0) // [Yes]
                try{
                    process.kill(Main.chromePID);
                }catch(error: any){}
        }

        Main.checkChromeProcess();
    }

    private static lookup(): Promise<process[]> {
        return new Promise((resolve: any, reject: any) => {
            exec(`wmic process where name="chrome.exe" get processid,parentprocessid,name`, (err, stdout, stderr) => {
                if(err)
                    reject(err);
                else{
                    let iname: number | null = null;
                    let ipid : number | null = null;
                    let ippid: number | null = null;

                    const processes: process[] = [];
                    for(const line of stdout.trim().split(/\r*\n/)){
                        const values: string[] = line.trim().split(/\s+/);
                        // header indexes
                        if(iname == null || ipid == null || ippid == null){
                            iname = values.indexOf("Name");
                            ipid  = values.indexOf("ProcessId");
                            ippid = values.indexOf("ParentProcessId");
                        }else // processes
                            processes.push({
                                name: values[iname],
                                pid : parseInt(values[ipid]),
                                ppid: parseInt(values[ippid])
                            });
                    }
                    resolve(processes);
                }
                resolve([]);
            });

        });
    }

    private static find(processes: process[], pid: number): process | null {
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
        process.exit(-1);
    }
});

Main.main().catch((error: Error) => {
    console.error(error.stack);
    if(app){
        if(Main.tray)
            Main.tray.destroy();
        app.quit();
        process.exit(-1);
    }
});