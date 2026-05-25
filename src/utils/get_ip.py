import socket
import requests

def get_local_ips():
    hostname = socket.gethostname()
    ips = socket.gethostbyname_ex(hostname)[2]
    return [ip for ip in ips if not ip.startswith("127.")]

def get_public_ip():
    try:
        return requests.get('https://api.ipify.org', timeout=3).text
    except:
        return "No disponible"
