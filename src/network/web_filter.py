import requests

class WebFilter:
    def __init__(self):
        self.blocked_domains = ["phishing-example.com", "malware-site.org"]

    def check_url(self, url):
        # Simplificado: consulta lista negra local o API de reputación
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        if any(blocked in domain for blocked in self.blocked_domains):
            return False
        # Podría ampliarse con consultas a Safe Browsing
        return True
