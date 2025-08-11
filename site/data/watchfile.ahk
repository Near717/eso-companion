#Requires AutoHotKey v2.0
#Warn
#Include WatchFolder.ahk
#SingleInstance Force
Persistent
TraySetIcon(A_WorkingDir . "\nexus.ico")

; Try to find pythonw.exe in PATH
pythonwPath := GetPythonwPath()
if !FileExist(pythonwPath) {
    MsgBox("Could not find pythonw.exe in PATH. Please install Python or add it to PATH.", "Error")
    ExitApp
}

scriptPath := A_ScriptDir . "\convertluatojson.py"
WatchedFile := A_MyDocuments . "\Elder Scrolls Online\live\SavedVariables\NearDailyInfo.lua"
WatchedFolder := A_MyDocuments . "\Elder Scrolls Online\live\SavedVariables"
If !FileExist(WatchedFolder) {
	MsgBox(WatchedFolder . " isn't a valid name!", "Error")
	Return
}

WatchFolder(WatchedFolder, MyUserFunc, False, 16)

MyUserFunc(path, changes) {
	For k, change In changes
		if (change.Action = 3 and change.Name = WatchedFile) {
			changed()
			return
		}
}

; action triggers twice so block the funcion temporarily 
enableSend := true
changed() {
	if (enableSend)
	{
		Global enableSend := false
		Run('"' pythonwPath '" "' scriptPath '"', A_ScriptDir)
	}
	SetTimer toggle, 1000
	return
}

toggle() {
	Global enableSend := true
	return
}

; Function to get full path to pythonw.exe using 'where' command
GetPythonwPath() {
    ; Run the 'where pythonw' command and capture output
    shell := ComObject("WScript.Shell")
    exec := shell.Exec("where pythonw")
    path := exec.StdOut.ReadLine()
    return path
}