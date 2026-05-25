class ReputationService:
    @staticmethod
    def query_file_reputation(file_hash):
        # Simulación: consulta a un servicio en la nube o lista local
        # En producción usaría una API REST
        # Por ahora devolvemos 0.0 (limpio) o 1.0 (malicioso) según hash conocido
        malicious_hashes = [
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",  # ejemplo
        ]
        if file_hash in malicious_hashes:
            return 1.0
        return 0.0
