import os
import struct

class StaticHeuristic:
    def __init__(self, file_path):
        self.file_path = file_path
        self.file_size = os.path.getsize(file_path)

    def analyze(self):
        score = 0.0
        reasons = []

        # Chequeos simples de PE (si es Windows)
        try:
            with open(self.file_path, 'rb') as f:
                header = f.read(2)
                if header == b'MZ':
                    score += 0.1
                    reasons.append("Ejecutable Windows (PE)")
                    f.seek(0x3C)
                    pe_offset = struct.unpack('<I', f.read(4))[0]
                    f.seek(pe_offset)
                    pe_sig = f.read(4)
                    if pe_sig == b'PE\0\0':
                        # Verificar secciones sospechosas, imports, etc.
                        score += 0.05
                        reasons.append("Cabecera PE válida")
        except:
            pass

        # Entropía (simplificada)
        try:
            with open(self.file_path, 'rb') as f:
                data = f.read()
            entropy = self._entropy(data)
            if entropy > 7.5:
                score += 0.3
                reasons.append(f"Entropía alta ({entropy:.2f}) -> posible ofuscación")
        except:
            pass

        # Strings sospechosos
        suspicious_strings = [b'http://', b'https://', b'cmd.exe', b'powershell', b'CreateRemoteThread']
        try:
            with open(self.file_path, 'rb') as f:
                data = f.read()
            for s in suspicious_strings:
                if s in data:
                    score += 0.15
                    reasons.append(f"String sospechoso: {s.decode(errors='ignore')}")
        except:
            pass

        return min(score, 1.0), reasons

    def extract_ml_features(self):
        # Características simples para ML
        return [self.file_size, self._entropy(open(self.file_path, 'rb').read())]

    def _entropy(self, data):
        import math
        if not data:
            return 0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x))/len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy
