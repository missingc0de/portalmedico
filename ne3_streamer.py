# -*- coding: utf-8 -*-
import os
import socket
import struct
import time
import json
import threading
from math import atan2, degrees
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

def short_to_bytes(l):
    return struct.pack("<H", l)

def int_to_bytes(i):
    return struct.pack("<Q", i)

def msg_ack_img(img_number):
    return int_to_bytes(img_number) + bytes.fromhex("0100000014000000ffffffff")

def msg_req_img(img_number):
    return int_to_bytes(img_number) + bytes.fromhex("0300000010000000")

class Header:
    def __init__(self, packet):
        data = packet[:56]
        (self.length, self.img_number, img_number2, self.packet_number, self.packet_count, self.img_size, self.img_width, self.img_height, self.img_quality) = struct.unpack("<xxHxxxxQQxxxxxxxxIIIHHBxxxxxxx", data)

class Frame:
    def __init__(self, header):
        self.header = header
        self.chunks = {}
        self.angle = 0

    def add(self, data):
        header = Header(data)
        d = data[56:]
        if header.packet_number == 0 and len(d) > 1024:
            try:
                a = d[1024:]
                x = int(a[:5].decode(errors='ignore'))
                y = int(a[6:].decode(errors='ignore'))
                if x == 0 and y == 1024:
                    self.angle = 90
                else:
                    self.angle = degrees(atan2(x, y))
            except Exception:
                pass
        self.chunks[header.packet_number] = d[:1024]

    def complete(self):
        return len(self.chunks) == self.header.packet_count

    def data(self):
        data = Frame.assemble_jpeg_header(self.header.img_quality, self.header.img_height, self.header.img_width)
        for i in range(self.header.packet_count):
            data += self.chunks.get(i, b"")
        data += bytes.fromhex("ffd9")
        return data

    @staticmethod
    def assemble_jpeg_header(q, h, w):
        out = bytes()
        out += bytes.fromhex("ffd8")
        if q == 5:
            out += bytes.fromhex("ffdb004300a06e788c7864a08c828cb4aaa0bef0fffff0dcdcf0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
            out += bytes.fromhex("ffdb004301aab4b4f0d2f0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        elif q == 10:
            out += bytes.fromhex("ffdb00430050373c463c32504641465a55505f78c882786e6e78f5afb991c8ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
            out += bytes.fromhex("ffdb004301555a5a786978eb8282ebffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        elif q == 25:
            out += bytes.fromhex("ffdb0043002016181c1814201c1a1c24222026305034302c2c3062464a3a5074667a787266706e8090b89c8088ae8a6e70a0daa2aebec4ced0ce7c9ae2f2e0c8f0b8cacec6")
            out += bytes.fromhex("ffdb004301222424302a305e34345ec6847084c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6")
        elif q == 50:
            out += bytes.fromhex("ffdb004300100b0c0e0c0a100e0d0e1211101318281a181616183123251d283a333d3c3933383740485c4e404457453738506d51575f626768673e4d71797064785c656763")
            out += bytes.fromhex("ffdb0043011112121815182f1a1a2f634238426363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363")
        elif q == 75:
            out += bytes.fromhex("ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432")
            out += bytes.fromhex("ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232")
        else: # q: 100
            out += bytes.fromhex("ffdb00430001010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101")
            out += bytes.fromhex("ffdb00430101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101")
        out += bytes.fromhex("ffc0001108")
        out += struct.pack(">hh", h, w)
        out += bytes.fromhex("03011100021101031101")
        out += bytes.fromhex("ffc4001f0000010501010101010100000000000000000102030405060708090a0b")
        out += bytes.fromhex("ffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9fa")
        out += bytes.fromhex("ffc4001f0100030101010101010101010000000000000102030405060708090a0b")
        out += bytes.fromhex("ffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9fa")
        out += bytes.fromhex("ffda000c03010002110311003f00")
        return out

class OtoscopeStreamer:
    def __init__(self, target_ip="192.168.169.1", target_port=8800):
        self.target_ip = target_ip
        self.target_port = target_port
        self.running = False
        self.sock = None
        self.latest_jpeg = None
        self.latest_angle = 0
        self.last_frame_time = 0
        self.lock = threading.Lock()
        self.new_frame_event = threading.Event()
        self.thread = None
        self.http_thread = None

    def _get_bind_ip(self):
        try:
            s_test = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s_test.connect((self.target_ip, self.target_port))
            local_ip = s_test.getsockname()[0]
            s_test.close()
            return local_ip
        except Exception:
            return "0.0.0.0"

    def _send_init(self):
        try:
            self.sock.sendto(bytes([0xef, 0x00, 0x04, 0x00]), (self.target_ip, self.target_port))
        except Exception:
            pass

    def _send_msgs(self, msgs):
        to_send = bytes.fromhex("02020001")
        to_send += int_to_bytes(len(msgs))
        to_send += bytes.fromhex("0000000000000000")
        to_send += bytes.fromhex("0a4b142d00000000")
        for msg in msgs:
            to_send += msg
        to_send += bytes.fromhex("0000000000000000")
        to_send = bytes([0xef, 0x02]) + short_to_bytes(len(to_send) + 4) + to_send
        try:
            self.sock.sendto(to_send, (self.target_ip, self.target_port))
        except Exception:
            pass

    def _send_null_pkt(self):
        try:
            self.sock.sendto(bytes(), (self.target_ip, 1234))
        except Exception:
            pass

    def is_connected(self):
        return (time.time() - self.last_frame_time) < 2.5

    def get_status(self):
        return {
            "connected": self.is_connected(),
            "angle": self.latest_angle
        }

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        self.start_http_server(8765)

    def stop(self):
        self.running = False
        if self.sock:
            try:
                self.sock.close()
            except Exception:
                pass

    def reconnect(self):
        if self.sock:
            self._send_init()

    def start_http_server(self, port=8765):
        if self.http_thread and self.http_thread.is_alive():
            return
        
        class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
            daemon_threads = True
            allow_reuse_address = True

        service_ref = self

        class OtoscopeHTTPHandler(BaseHTTPRequestHandler):
            def log_message(self, format, *args):
                pass

            def end_headers(self):
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', '*')
                super().end_headers()

            def do_OPTIONS(self):
                self.send_response(200)
                self.end_headers()

            def do_GET(self):
                if self.path.startswith('/api/otoscopio/stream'):
                    self.send_response(200)
                    self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
                    self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                    self.send_header('Pragma', 'no-cache')
                    self.send_header('Expires', '0')
                    self.end_headers()
                    try:
                        while True:
                            service_ref.new_frame_event.wait(timeout=0.5)
                            service_ref.new_frame_event.clear()
                            with service_ref.lock:
                                frame = service_ref.latest_jpeg
                            if frame:
                                header = b'--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ' + str(len(frame)).encode() + b'\r\n\r\n'
                                self.wfile.write(header + frame + b'\r\n')
                            else:
                                time.sleep(0.04)
                    except Exception:
                        return
                elif self.path.startswith('/api/otoscopio/snapshot'):
                    with service_ref.lock:
                        frame = service_ref.latest_jpeg
                    if not frame:
                        self.send_response(503)
                        self.end_headers()
                        return
                    self.send_response(200)
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', str(len(frame)))
                    self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                    self.end_headers()
                    self.wfile.write(frame)
                    return
                elif self.path.startswith('/api/otoscopio/status'):
                    status = json.dumps(service_ref.get_status()).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Length', str(len(status)))
                    self.end_headers()
                    self.wfile.write(status)
                    return
                else:
                    self.send_response(404)
                    self.end_headers()

            def do_POST(self):
                if self.path.startswith('/api/otoscopio/reconnect'):
                    service_ref.reconnect()
                    res = json.dumps({"success": True}).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Length', str(len(res)))
                    self.end_headers()
                    self.wfile.write(res)
                    return
                elif self.path.startswith('/api/otoscopio/save_dialog'):
                    try:
                        content_len = int(self.headers.get('Content-Length', 0))
                        post_body = self.rfile.read(content_len)
                        body = json.loads(post_body.decode('utf-8'))
                        data_url = body.get('dataUrl', '')
                        filename = body.get('filename', 'otoscopia.png')
                        
                        import base64
                        header, encoded = data_url.split(',', 1)
                        file_bytes = base64.b64decode(encoded)

                        saved_path = None
                        try:
                            import tkinter as tk
                            from tkinter import filedialog
                            root = tk.Tk()
                            root.withdraw()
                            root.attributes('-topmost', True)
                            saved_path = filedialog.asksaveasfilename(
                                initialfile=filename,
                                defaultextension=".png",
                                filetypes=[("Imagen Médica PNG", "*.png"), ("Todos los archivos", "*.*")]
                            )
                            root.destroy()
                        except Exception:
                            pass

                        if not saved_path:
                            res = json.dumps({"success": False, "cancelled": True}).encode('utf-8')
                            self.send_response(200)
                            self.send_header('Content-Type', 'application/json')
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.send_header('Content-Length', str(len(res)))
                            self.end_headers()
                            self.wfile.write(res)
                            return

                        with open(saved_path, 'wb') as f:
                            f.write(file_bytes)

                        res = json.dumps({"success": True, "path": saved_path}).encode('utf-8')
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Content-Length', str(len(res)))
                        self.end_headers()
                        self.wfile.write(res)
                        return
                    except Exception as e:
                        err_res = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                        self.send_response(500)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Content-Length', str(len(err_res)))
                        self.end_headers()
                        self.wfile.write(err_res)
                        return
                self.send_response(404)
                self.end_headers()

        def _serve():
            try:
                server = ThreadedHTTPServer(('127.0.0.1', port), OtoscopeHTTPHandler)
                server.serve_forever()
            except Exception as e:
                print(f"Otoscope HTTP server on {port} stopped/could not bind: {e}")

        self.http_thread = threading.Thread(target=_serve, daemon=True)
        self.http_thread.start()

    def _run(self):
        while self.running:
            try:
                bind_ip = self._get_bind_ip()
                self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.sock.bind((bind_ip, 36000))
                self.sock.settimeout(0.025)
                self._send_null_pkt()
                self._send_init()

                current_frame = None
                last_full_image = 0
                last_msg = time.time()
                last_request_more = time.time()
                last_null_packet = time.time()

                while self.running:
                    try:
                        data, addr = self.sock.recvfrom(1500)
                    except TimeoutError:
                        now = time.time()
                        if now > last_msg + 0.5:
                            self._send_init()
                            current_frame = None
                            last_full_image = 0
                            continue
                        if last_full_image > 0 and current_frame and last_full_image == current_frame.header.img_number:
                            self._send_msgs([msg_ack_img(current_frame.header.img_number), msg_req_img(current_frame.header.img_number + 1)])
                        else:
                            self._send_msgs([])
                        continue
                    except Exception:
                        break

                    last_msg = time.time()
                    if len(data) < 56 or data[0] != 0x93:
                        continue
                    if data[1] != 0x01:
                        continue

                    try:
                        header = Header(data)
                        if not current_frame:
                            current_frame = Frame(header)
                        if header.img_number > current_frame.header.img_number:
                            current_frame = Frame(header)
                        elif header.img_number < current_frame.header.img_number:
                            continue

                        current_frame.add(data)
                        if current_frame.complete():
                            jpeg_data = current_frame.data()
                            with self.lock:
                                self.latest_jpeg = jpeg_data
                                self.latest_angle = current_frame.angle
                                self.last_frame_time = time.time()
                            self.new_frame_event.set()
                            last_full_image = current_frame.header.img_number
                            self._send_msgs([msg_ack_img(current_frame.header.img_number), msg_req_img(current_frame.header.img_number + 1)])
                        elif time.time() > last_request_more + 0.025:
                            self._send_msgs([])
                            last_request_more = time.time()

                        if time.time() > last_null_packet + 5:
                            self._send_null_pkt()
                            last_null_packet = time.time()
                    except Exception:
                        pass
            except Exception:
                time.sleep(1)
            finally:
                if self.sock:
                    try:
                        self.sock.close()
                    except Exception:
                        pass
                time.sleep(1)

# Global singleton
otoscope_service = OtoscopeStreamer()

if __name__ == '__main__':
    print("Iniciando servicio de streaming de otoscopio en http://127.0.0.1:8765...")
    otoscope_service.start()
    while True:
        time.sleep(1)
        st = otoscope_service.get_status()
        if st['connected']:
            print(f"Otoscopio conectado! Angulo: {st['angle']:.1f}")
