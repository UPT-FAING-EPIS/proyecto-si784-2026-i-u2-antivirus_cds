[Setup]
AppName=AntivirusRobusto
AppVersion=1.0
DefaultDirName={pf}\AntivirusRobusto
DefaultGroupName=AntivirusRobusto
OutputDir=installer\Output
OutputBaseFilename=AntivirusRobusto_Setup
Compression=lzma
SolidCompression=yes
UninstallDisplayIcon={app}\main.exe

[Files]
; Ejecutable y dependencias generados por PyInstaller
Source: "dist\main\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Datos adicionales (firmas, sandbox, modelos)
Source: "data\*"; DestDir: "{app}\data"; Flags: recursesubdirs

[Icons]
Name: "{group}\Antivirus Robusto"; Filename: "{app}\main.exe"
Name: "{commondesktop}\Antivirus Robusto"; Filename: "{app}\main.exe"
Name: "{group}\Desinstalar"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\main.exe"; Description: "Ejecutar Antivirus Robusto"; Flags: postinstall nowait skipifsilent