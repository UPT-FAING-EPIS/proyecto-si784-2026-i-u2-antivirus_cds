import sys
import os
import json

def simulate_behavior(file_path):
    # Comportamiento simulado: si el archivo contiene 'MALWARE', es malicioso
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        if b'MALWARE' in content:
            return "MALICIOUS"
        return "CLEAN"
    except:
        return "CLEAN"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(simulate_behavior(sys.argv[1]))
    else:
        print("CLEAN")