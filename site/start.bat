@echo off
title ESO Companion
echo Starting ESO Companion

REM Update data
echo Updating data
start "" pythonw "data\convertluatojson.py"

REM Start file watcher
echo Starting watchfile.ahk in a separate process
start "" "data\watchfile.ahk"

REM Start live-server
call live-server --no-browser --ignore='README.MD,.bat,.\node_modules'

pause
