#!/usr/bin/env python3
"""
Simple HTTP server with code snippet serving capability
Serves the docs directory and provides a /api/code endpoint to read source files
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import mimetypes

class CodeSnippetHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle code API requests
        if self.path.startswith('/api/code?'):
            self.handle_code_request()
        else:
            super().do_GET()

    def handle_code_request(self):
        try:
            # Parse query parameters
            query = self.path.split('?', 1)[1]
            params = {}
            for param in query.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
            
            file_path = params.get('file', '')
            start_line = int(params.get('start', 1)) - 1  # Convert to 0-indexed
            end_line = int(params.get('end', 1))
            
            # Security: ensure file_path doesn't escape the project root
            if '..' in file_path or file_path.startswith('/'):
                self.send_error(403, 'Access denied')
                return
            
            # Try to read the file
            # First check if it's an absolute path (common in resolver maps)
            if file_path.startswith('/'):
                # It's absolute - we can't serve it, but we'll try relative to home
                file_path = file_path.lstrip('/')
            
            if not os.path.exists(file_path):
                # Try alternative paths
                alternative_paths = [
                    os.path.expanduser('~/' + file_path),
                    '/'.join(file_path.split('/')[-3:]),  # Last 3 path segments
                ]
                found = False
                for alt_path in alternative_paths:
                    if os.path.exists(alt_path):
                        file_path = alt_path
                        found = True
                        break
                
                if not found:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'error': f'File not found: {file_path}',
                        'suggested_path': file_path
                    }).encode())
                    return
            
            # Read the file and extract lines
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            
            # Extract the requested range
            code_lines = lines[start_line:end_line]
            code = ''.join(code_lines)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'file': file_path,
                'startLine': start_line + 1,
                'endLine': min(end_line, len(lines)),
                'code': code
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    # Change to docs directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(script_dir, 'docs')
    os.chdir(docs_dir)
    
    server = HTTPServer(('localhost', port), CodeSnippetHandler)
    print(f'Serving {docs_dir} on http://localhost:{port}')
    print(f'Code API available at http://localhost:{port}/api/code?file=<path>&start=<line>&end=<line>')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
        sys.exit(0)
