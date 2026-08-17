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
        base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
        dist_dir = os.path.join(base_dir, 'dist')
        if not os.path.exists(os.path.join(dist_dir, 'index.html')) and os.path.exists(os.path.join(base_dir, 'index.html')):
            dist_dir = base_dir
    else:
        dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    return dist_dir

def make_handler(dist_directory):
    class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=dist_directory, **kwargs)

        def translate_path(self, path):
            # Clean path from query strings and fragments
            clean_path = path.split('?', 1)[0].split('#', 1)[0]
            if clean_path in ('', '/', '/index', '/index.html', '/index.htm'):
                return os.path.join(dist_directory, 'index.html')
            
            rel_path = clean_path.lstrip('/')
            full_path = os.path.join(dist_directory, rel_path)
            if not os.path.exists(full_path):
                return os.path.join(dist_directory, 'index.html')
            return full_path

        def log_message(self, format, *args):
            pass

    return SPAHTTPRequestHandler

def start_server(dist_dir, port):
    os.chdir(dist_dir)
    handler_class = make_handler(dist_dir)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), handler_class) as httpd:
        httpd.serve_forever()

def main():
    dist_dir = get_dist_dir()
    index_html = os.path.join(dist_dir, 'index.html')
    
    if not os.path.exists(index_html):
        print(f"Error: 'index.html' not found in '{dist_dir}'.")
        sys.exit(1)

    port = find_free_port()
    server_thread = threading.Thread(target=start_server, args=(dist_dir, port), daemon=True)
    server_thread.start()

    url = f'http://127.0.0.1:{port}/'
    
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
