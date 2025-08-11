# ESO Companion

## Overview

ESO Companion is a tool for converting data related to Elder Scrolls Online.

## Converter in Python Dependencies

- [Python](https://www.python.org/downloads/)
- [lupa](https://pypi.org/project/lupa/)

## Run Locally

You can use [http-server](https://www.npmjs.com/package/http-server) or [live-server](https://www.npmjs.com/package/live-server) to run the application locally.

## Setup Instructions

1. **Settings Configuration**:
   - Set up the settings file: `.\site\src\config.js`.

2. **AddOn Installation**:
   - Copy or create a symlink (use `mklink` on Windows or `ln -s` on Linux) of the addon folder (`NearDailyInfo`) to the addons folder at `%USERPROFILE%\Documents\Elder Scrolls Online\live\AddOns`.
   - Log in to a character in the game and perform a `ReloadUI` or log out; this will create the data file.

3. **Data File Linking**:
   - Create a symlink for the data file (`NearDailyInfo.lua`) from `%USERPROFILE%\Documents\Elder Scrolls Online\live\SavedVariables` to `.\site\data` with the name `data.lua`.

4. **Running the Application**:
   - Run `start.bat` to initiate the application.

## ~~Converter in Lua Dependencies~~

- ~~[Lua](https://www.lua.org/download.html)~~
- ~~[lua-cjson](https://luarocks.org/modules/openresty/lua-cjson)~~

### ~~Windows~~

~~Install Lua and lua-cjson on Windows Subsystem for Linux.~~
