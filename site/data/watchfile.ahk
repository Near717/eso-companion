#Requires AutoHotKey v2.0
#Warn
#Include WatchFolder.ahk
#SingleInstance Force
Persistent

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
		Run "runconverter_py"
	}
	SetTimer toggle, 1000
	return
}

toggle() {
	Global enableSend := true
	return
}