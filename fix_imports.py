import os
import re

src_dir = "src"
modules = ["ui", "engine", "core", "database", "network", "utils"]

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if not file.endswith(".py"):
            continue
        path = os.path.join(root, file)
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        new_lines = []
        for line in lines:
            stripped = line.lstrip()
            # Reemplazar "from modulo." por "from src.modulo."
            for mod in modules:
                # Patrón: línea que empieza con "from modulo." (con posible espacio inicial)
                if re.match(rf"^from {mod}\.", stripped):
                    line = line.replace(f"from {mod}.", f"from src.{mod}.", 1)
                    break
                # Patrón: "import modulo" (posible alias) al inicio de la línea
                elif re.match(rf"^import {mod}\b", stripped):
                    line = line.replace(f"import {mod}", f"import src.{mod}", 1)
                    break
            new_lines.append(line)

        with open(path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

print("Imports corregidos correctamente.")