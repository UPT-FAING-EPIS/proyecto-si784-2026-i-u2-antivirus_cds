# External Scanner Binaries

This directory is used to store the compiled binaries from the other two projects:

- `secret-scanner.exe` — Python secret scanner (compiled with PyInstaller)
- `dep-analyzer.exe` — Kotlin dependency analyzer (compiled with GraalVM Native Image)

## Setup

1. Build the secret scanner: `pyinstaller --onefile main.py -n secret-scanner`
2. Build the dependency analyzer with GraalVM native-image
3. Copy both `.exe` files into this directory

> **Note:** The binary files are **not** tracked in git. They must be placed here manually before building the installer.
