#!/usr/bin/env python3
"""
Simple HTTP server with proper Range request support for video streaming
This allows video seeking/scrubbing to work properly
"""

import os
import re
import http.server
import socketserver
from pathlib import Path

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with support for Range requests (needed for video seeking)"""
    
    def send_head(self):
        """Common code for GET and HEAD commands with Range support"""
        path = self.translate_path(self.path)
        
        # Handle directory requests
        if os.path.isdir(path):
            if not self.path.endswith('/'):
                # Redirect to path with trailing slash
                self.send_response(301)
                self.send_header("Location", self.path + "/")
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return http.server.SimpleHTTPRequestHandler.send_head(self)
        
        # Check if file exists
        if not os.path.exists(path):
            return http.server.SimpleHTTPRequestHandler.send_head(self)
        
        # Get file info
        try:
            f = open(path, 'rb')
        except IOError:
            self.send_error(404, "File not found")
            return None
        
        fs = os.fstat(f.fileno())
        file_len = fs[6]
        
        # Check for Range header
        range_header = self.headers.get('Range')
        
        if range_header:
            # Parse range header
            range_match = re.search(r'bytes=(\d+)-(\d*)', range_header)
            if range_match:
                start = int(range_match.group(1))
                end = range_match.group(2)
                end = int(end) if end else file_len - 1
                
                # Ensure valid range
                if start >= file_len:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    return None
                
                end = min(end, file_len - 1)
                length = end - start + 1
                
                # Send partial content response
                self.send_response(206)
                self.send_header("Content-Type", self.guess_type(path))
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_len}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Cache-Control", "public, max-age=0")
                self.end_headers()
                
                # Seek to start position and return file
                f.seek(start)
                return f
        
        # No range header - send full file
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Length", str(file_len))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "public, max-age=0")
        self.end_headers()
        
        return f
    
    def copyfile(self, source, outputfile):
        """Copy data with proper handling for broken pipes"""
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            # Client disconnected - this is normal for video seeking
            pass


def run_server(port=8000):
    """Start the HTTP server with Range support"""
    handler = RangeHTTPRequestHandler
    
    # Allow socket reuse to prevent "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🚀 Srisin Family Website Server")
        print(f"📡 Server running at http://localhost:{port}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"✨ Range requests enabled for video seeking")
        print(f"\n⌨️  Press Ctrl+C to stop\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
