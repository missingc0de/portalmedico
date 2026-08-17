import os
import sys
import json
import urllib.request
import subprocess
import webview

APP_VERSION = "1.3.0"
GITHUB_REPO = "missingc0de/portalmedico"

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

                return {
                    "hasUpdate": bool(latest_tag and latest_tag != APP_VERSION),
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

if __name__ == '__main__':
    dist_dir = get_dist_path()
    entry_html = os.path.join(dist_dir, 'index.html')
    if not os.path.exists(entry_html):
        print(f"Error: File '{entry_html}' not found.")
        sys.exit(1)
        
    api = Api()
    
    window = webview.create_window(
        'PORTAL MÉDICO',
        entry_html,
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
