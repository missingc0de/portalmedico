import os
import sys
import threading
import socket
import http.server
import socketserver
import webview

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def get_dist_dir():
    if getattr(sys, 'frozen', False):
        # Bundled by PyInstaller
        base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
        dist_dir = os.path.join(base_dir, 'dist')
    else:
        dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    return dist_dir

class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server(dist_dir, port):
    os.chdir(dist_dir)
    handler = QuietHTTPRequestHandler
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)
    httpd.serve_forever()

def main():
    dist_dir = get_dist_dir()
    if not os.path.exists(dist_dir):
        print(f"Error: Directory '{dist_dir}' not found.")
        sys.exit(1)

    port = find_free_port()
    server_thread = threading.Thread(target=start_server, args=(dist_dir, port), daemon=True)
    server_thread.start()

    url = f'http://127.0.0.1:{port}'
    
    window = webview.create_window(
        title='PORTAL MÉDICO',
        url=url,
        width=1366,
        height=850,
        min_size=(900, 600),
        resizable=True,
        confirm_close=False,
        text_select=True
    )
    
    webview.start(debug=False)

if __name__ == '__main__':
    main()
