import hashlib
import yara
import os
from enum import Enum
from src.database.db_manager import DatabaseManager
from src.engine.signatures import SignatureManager
from src.engine.heuristics import StaticHeuristic
from src.engine.ml_classifier import MLClassifier
from src.engine.sandbox_manager import SandboxManager
from src.engine.reputation import ReputationService
from src.utils.config import Config
from src.utils.logger import log

class Verdict(Enum):
    CLEAN = 1
    SUSPICIOUS = 2
    MALICIOUS = 3
    UNKNOWN = 4

class ScanResult:
    def __init__(self, verdict, threat_name="", details=""):
        self.verdict = verdict
        self.threat_name = threat_name
        self.details = details

def EscanearArchivo(file_path, config_dict):
    """
    Analiza un archivo combinando firmas, heurística, ML y sandbox.
    Retorna un ScanResult con el veredicto final.
    """
    db = DatabaseManager()
    sig_manager = SignatureManager()
    ml = MLClassifier()
    sandbox = SandboxManager(config_dict.get('sandbox_path', 'data/sandbox'))

    # 1. Hash
    sha256 = _hash_file(file_path)

    # 2. Listas locales
    if db.is_whitelisted(sha256):
        return ScanResult(Verdict.CLEAN, details="Whitelist local")
    if db.is_blacklisted(sha256):
        threat = db.get_threat_name(sha256)
        return ScanResult(Verdict.MALICIOUS, threat_name=threat, details="Blacklist local")

    # 3. Firmas YARA
    if sig_manager.match_yara(file_path):
        matches = sig_manager.match_yara(file_path)
        threat = str(matches[0])
        return ScanResult(Verdict.MALICIOUS, threat_name=threat, details=f"Firma YARA: {threat}")

    # 4. Heurística estática
    heur = StaticHeuristic(file_path)
    static_score, reasons = heur.analyze()

    # 5. ML
    features = heur.extract_ml_features()
    ml_score = ml.predict_proba(features) if ml.model else 0.5

    # 6. Reputación (simulada)
    rep_score = ReputationService.query_file_reputation(sha256)

    # Combinar puntuaciones
    combined_score = 0.4 * static_score + 0.3 * ml_score + 0.3 * rep_score

    threshold_sandbox = config_dict.get('threshold_sandbox', 0.3)
    threshold_block = config_dict.get('threshold_block', 0.7)

    if combined_score < threshold_sandbox:
        return ScanResult(Verdict.CLEAN, details=f"Score bajo {combined_score:.2f}")
    elif combined_score >= threshold_block:
        db.move_to_quarantine(file_path, "Heur.AI.Suspicious", f"Score {combined_score:.2f}")
        return ScanResult(Verdict.MALICIOUS, threat_name="Gen.Heur.ML", details=f"Score alto {combined_score:.2f}")
    else:
        if config_dict.get('auto_sandbox', True):
            verdict, log = sandbox.run_and_monitor(file_path)
            if verdict == Verdict.MALICIOUS:
                db.move_to_quarantine(file_path, "Sandbox.Detected", log)
                return ScanResult(Verdict.MALICIOUS, threat_name="Sandbox.Detected", details=log)
            else:
                return ScanResult(Verdict.CLEAN, details="Sandbox: sin actividad maliciosa")
        else:
            return ScanResult(Verdict.SUSPICIOUS, details="Requiere análisis manual")

def _hash_file(path):
    sha256 = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()