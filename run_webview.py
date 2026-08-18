import os
import sys
import json
import ssl
import socket
import threading
import urllib.request
import subprocess
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import webview

APP_VERSION = "1.4.5"

def check_webview2_runtime():
    """
    Check if Microsoft Edge WebView2 Runtime is installed on the system.
    Returns True if available, False otherwise.
    Shows a user-friendly error dialog if missing.
    """
    try:
        import winreg
        # Check both HKLM and HKCU for WebView2 Runtime
        paths = [
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
            (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"),
        ]
        for hive, path in paths:
            try:
                key = winreg.OpenKey(hive, path)
                winreg.CloseKey(key)
                return True  # Found WebView2 Runtime
            except (FileNotFoundError, OSError):
                continue
        # Not found in registry
        return False
    except Exception:
        # If winreg check fails, assume it's present and let pywebview handle it
        return True

def prompt_install_webview2():
    """Show a dialog asking the user to install WebView2 Runtime."""
    try:
        import ctypes
        result = ctypes.windll.user32.MessageBoxW(
            0,
            "PORTAL MÉDICO requiere Microsoft Edge WebView2 Runtime, que no está instalado en este equipo.\n\n"
            "¿Desea abrir la página de descarga para instalarlo?\n\n"
            "Después de instalarlo, reinicie PORTAL MÉDICO.",
            "Componente requerido no encontrado",
            0x00000034  # MB_YESNO | MB_ICONWARNING
        )
        if result == 6:  # IDYES
            subprocess.Popen(["start", "https://go.microsoft.com/fwlink/p/?LinkId=2124703"], shell=True)
    except Exception as e:
        print(f"Error showing WebView2 install dialog: {e}")

GITHUB_REPO = "missingc0de/portalmedico"


def get_safe_ssl_context():
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    except Exception:
        return ssl._create_unverified_context()

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
            ssl_ctx = get_safe_ssl_context()
            with urllib.request.urlopen(req, timeout=12, context=ssl_ctx) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                latest_tag = data.get("tag_name", "").lstrip('v')
                body = data.get("body", "")
                assets = data.get("assets", [])
                
                download_url = ""
                for asset in assets:
                    name = asset.get("name", "")
                    if "Setup" in name and name.lower().endswith(".exe"):
                        download_url = asset.get("browser_download_url", "")
                        break

                if not download_url:
                    for asset in assets:
                        name = asset.get("name", "")
                        if name.lower().endswith(".exe"):
                            download_url = asset.get("browser_download_url", "")
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
            ssl_ctx = get_safe_ssl_context()
            with urllib.request.urlopen(req, timeout=120, context=ssl_ctx) as resp, open(installer_path, "wb") as f:
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

    def save_and_open_pdf(self, base64_data, filename="documento.pdf"):
        try:
            import base64, os
            if not base64_data:
                return {"success": False, "error": "No base64 data provided"}
            if base64_data.startswith("data:"):
                base64_data = base64_data.split(",", 1)[1]
            raw_bytes = base64.b64decode(base64_data)
            
            desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop")
            if not os.path.exists(desktop_dir):
                desktop_dir = os.environ.get("TEMP", os.path.expanduser("~"))
                
            safe_name = "".join(c for c in filename if c.isalnum() or c in "._- ")
            if not safe_name.lower().endswith(".pdf"):
                safe_name += ".pdf"
                
            filepath = os.path.join(desktop_dir, safe_name)
            
            with open(filepath, "wb") as f:
                f.write(raw_bytes)
                
            print(f"Saved PDF to Desktop and opening: {filepath} ({len(raw_bytes)} bytes)")
            os.startfile(filepath)
            return {"success": True, "path": filepath}
        except Exception as e:
            print("Error saving/opening PDF:", e)
            return {"success": False, "error": str(e)}

    def open_pdf(self, base64_data, filename="documento.pdf"):
        return self.save_and_open_pdf(base64_data, filename)

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
    # Check for WebView2 Runtime before launching - shows friendly error if missing
    if not check_webview2_runtime():
        prompt_install_webview2()
        sys.exit(1)

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

