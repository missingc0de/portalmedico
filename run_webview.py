import os
import sys
import json
import socket
import threading
import urllib.request
import subprocess
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import webview

APP_VERSION = "1.3.2"
GITHUB_REPO = "missingc0de/portalmedico"

class ReusableTCPServer(TCPServer):
    allow_reuse_address = True

def is_newer_version(latest: str, current: str) -> bool:
    try:
        l = [int(x) for x in latest.replace('v', '').split('.') if x.isdigit()]
        c = [int(x) for x in current.replace('v', '').split('.') if x.isdigit()]
        for i in range(max(len(l), len(c))):
            l_num = l[i] if i < len(l) else 0
            c_num = c[i] if i < len(c) else 0
            if l_num > c_num:
                return True
            if l_num < c_num:
                return False
        return False
    except Exception:
        return latest != current

class Api:
    def __init__(self):
        self._window = None

    def set_window(self, window):
        self._window = window

    def get_version(self):
        return APP_VERSION

    def check_updates(self):
        try:
            url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
            req = urllib.request.Request(url, headers={"User-Agent": "PortalMedico-Updater"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                latest_tag = data.get("tag_name", "").lstrip('v')
                body = data.get("body", "")
                assets = data.get("assets", [])
                
                download_url = ""
                for asset in assets:
                    name = asset.get("name", "")
                    if name.endswith(".exe"):
                        download_url = asset.get("browser_download_url", "")
                        if "PortalMedico" in name or "Setup" in name:
                            break

                has_update = is_newer_version(latest_tag, APP_VERSION)

                return {
                    "hasUpdate": has_update,
                    "latestVersion": latest_tag,
                    "currentVersion": APP_VERSION,
                    "releaseNotes": body,
                    "downloadUrl": download_url
                }
        except Exception as e:
            print("Error checking updates:", e)
            return {"hasUpdate": False, "error": str(e), "currentVersion": APP_VERSION}

    def install_update(self, download_url):
        if not download_url:
            return {"success": False, "error": "No download URL provided"}
        try:
            temp_dir = os.environ.get("TEMP", os.path.expanduser("~"))
            installer_path = os.path.join(temp_dir, "PortalMedico_Update.exe")
            
            print(f"Downloading update from {download_url} to {installer_path}...")
            req = urllib.request.Request(download_url, headers={"User-Agent": "PortalMedico-Updater"})
            with urllib.request.urlopen(req) as resp, open(installer_path, "wb") as f:
                f.write(resp.read())
            
            print("Launching update installer...")
            subprocess.Popen([installer_path], shell=True)
            if self._window:
                self._window.destroy()
            return {"success": True}
        except Exception as e:
            print("Error installing update:", e)
            return {"success": False, "error": str(e)}

    def quit_app(self):
        if self._window:
            self._window.destroy()
        else:
            sys.exit(0)

def get_dist_path():
    if getattr(sys, 'frozen', False):
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, 'dist')

def create_handler_class(dist_directory):
    class SafeHTTPRequestHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=dist_directory, **kwargs)

        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()

        def log_message(self, format, *args):
            pass  # Suppress HTTP access logging
    return SafeHTTPRequestHandler

def start_server_on_free_port(dist_directory):
    ports = [15432, 15433, 15434, 15435, 15436, 15437, 0]
    handler_class = create_handler_class(dist_directory)
    
    for port in ports:
        try:
            httpd = ReusableTCPServer(('127.0.0.1', port), handler_class)
            actual_port = httpd.socket.getsockname()[1]
            server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            server_thread.start()
            print(f"Server started on http://127.0.0.1:{actual_port}/")
            return actual_port
        except Exception as e:
            print(f"Could not bind to port {port}: {e}")
            continue

    raise RuntimeError("Could not bind local HTTP server to any port")

if __name__ == '__main__':
    dist_dir = get_dist_path()
    if not os.path.exists(dist_dir):
        print(f"Error: Directory '{dist_dir}' not found.")
        sys.exit(1)
        
    port = start_server_on_free_port(dist_dir)
    url = f'http://127.0.0.1:{port}/'
    
    api = Api()
    
    window = webview.create_window(
        'PORTAL MÉDICO',
        url,
        width=1200,
        height=800,
        min_size=(800, 600),
        js_api=api,
        text_select=True,
        background_color='#F1F5F9'
    )
    
    api.set_window(window)
    
    appdata_dir = os.environ.get('APPDATA')
    if appdata_dir:
        storage_dir = os.path.join(appdata_dir, 'PortalMedicoStorage')
    else:
        storage_dir = os.path.join(os.path.expanduser('~'), '.portalmedicostorage')
    
    os.makedirs(storage_dir, exist_ok=True)
        
    webview.start(private_mode=False, storage_path=storage_dir)
