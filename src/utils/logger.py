import logging

def setup_logger():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("antivirus.log"),
            logging.StreamHandler()
        ]
    )
    log = logging.getLogger("Antivirus")
    log.info("Sistema iniciado")

def log():
    return logging.getLogger("Antivirus")
