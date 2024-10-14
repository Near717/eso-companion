@echo off
title ESO Companion
echo Starting ESO Companion

REM Update data
echo Updating data
@REM call data\runconverter_lua.lnk
call data\runconverter_py.lnk

REM Start file watcher
echo Starting watchfile.ahk in a separate process
start "" "data\watchfile.ahk"

REM Start live-server
call live-server --no-browser --ignore='README.MD,.bat'

pause
