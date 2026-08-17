import os
import sys
import socket
import threading
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import webview

def find_free_port():
    # Try a deterministic port first so that localStorage (tied to origin) persists between runs
    preferred_port = 15432
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', preferred_port))
            return preferred_port
    except OSError:
        pass
        
    # Fallback to random ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

class SafeHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_dist_path():
    if getattr(sys, 'frozen', False):
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, 'dist')

def start_server(port, directory):
    os.chdir(directory)
    handler = SafeHTTPRequestHandler
    with TCPServer(('127.0.0.1', port), handler) as httpd:
        httpd.serve_forever()

if __name__ == '__main__':
    dist_dir = get_dist_path()
    if not os.path.exists(dist_dir):
        print(f"Error: Directory '{dist_dir}' not found.")
        sys.exit(1)
        
    port = find_free_port()
    
    # Start the server in a daemon thread so it exits automatically when the main app exits
    server_thread = threading.Thread(target=start_server, args=(port, dist_dir), daemon=True)
    server_thread.start()
    
    url = f'http://127.0.0.1:{port}/'
    
    # Create window using native webview (Edge Chromium on Windows)
    window = webview.create_window(
        'Portal Médico',
        url,
        width=1200,
        height=800,
        min_size=(800, 600),
        text_select=True # Enable text selection
    )
    
    # Define dedicated storage directory in APPDATA for persistence
    appdata_dir = os.environ.get('APPDATA')
    if appdata_dir:
        storage_dir = os.path.join(appdata_dir, 'PortalMedico')
    else:
        storage_dir = os.path.join(os.path.expanduser('~'), '.portalmedico')
        
    webview.start(private_mode=False, storage_path=storage_dir)
