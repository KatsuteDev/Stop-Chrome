<div align="center">
    <a href="https://github.com/KatsuteDev/Stop-Chrome">
        <img src="https://raw.githubusercontent.com/KatsuteDev/Stop-Chrome/main/icon.png" alt="icon" width="100" height="100">
    </a>
    <h3>Stop Chrome</h3>
    <a href="https://github.com/KatsuteDev/Stop-Chrome/actions/workflows/npm_ci.yml"><img src="https://github.com/KatsuteDev/Stop-Chrome/actions/workflows/npm_ci.yml/badge.svg" title="npm CI"></a>
    <a href="https://github.com/KatsuteDev/Stop-Chrome/actions/workflows/deploy.yml"><img src="https://github.com/KatsuteDev/Stop-Chrome/actions/workflows/deploy.yml/badge.svg" title="Deploy"></a>
    <a href="https://github.com/KatsuteDev/Stop-Chrome/releases"><img title="version" src="https://img.shields.io/github/v/release/KatsuteDev/Stop-Chrome"></a>
    <a href="https://github.com/KatsuteDev/Stop-Chrome/blob/main/LICENSE"><img title="license" src="https://img.shields.io/github/license/KatsuteDev/Stop-Chrome"></a>
</div>

# Overview

Google Chrome has an awful issue where when you close it, it still runs in the background, even when the setting is turned off!
Stop Chrome is a desktop application that displays an indicator in the system tray, telling you whether Chrome is running or not, and allows you to quickly stop chrome running in the background.

<div align="center">
    <a href="https://github.com/KatsuteDev/Stop-Chrome">
        <img src="https://raw.githubusercontent.com/KatsuteDev/Stop-Chrome/main/sample.png" alt="sample">
    </a>
</div>

# Setup

> ⚠ Running this application may trigger your Antivirus. This is a FALSE POSITIVE. Add this application to the exception list if you don't want to see alerts.

 1. Download the latest release: [![version](https://img.shields.io/github/v/release/KatsuteDev/Stop-Chrome)](https://github.com/KatsuteDev/Stop-Chrome/releases)
 2. Either run the installer or extract the zip into the desired directory
     - Installer installs into `AppData/Local/Stop-Chrome`
 3. Run `Stop Chrome.exe`

# Contributing

<!-- GitHub Copilot Disclaimer -->
<table>
    <img alt="GitHub Copilot" align="left" src="https://raw.githubusercontent.com/KatsuteDev/.github/main/profile/copilot-dark.png#gh-dark-mode-only" width="50"><img alt="GitHub Copilot" align="left" src="https://raw.githubusercontent.com/KatsuteDev/.github/main/profile/copilot-light.png#gh-light-mode-only" width="50">
    <p>GitHub Copilot is <b>strictly prohibited</b> on this repository.<br>Pulls using this will be rejected.</p>
</table>
<!-- GitHub Copilot Disclaimer -->

- Build using `npm run build` or `npm run prepare`. Make sure to run `npm run rebuild` first.
- Test builds using `npm run start:dev`
- Package builds using `npm run make`

### License

This library is released under the [GNU General Public License (GPL) v2.0](https://github.com/KatsuteDev/Stop-Chrome/blob/main/LICENSE).