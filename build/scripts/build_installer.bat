@echo off
echo Compilando con PyInstaller...
pyinstaller build\pyinstaller\main.spec --distpath dist --workpath build\temp
echo Generando instalador con Inno Setup...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\InnoSetup\setup.iss
echo Instalador creado en installer\Output\
pause