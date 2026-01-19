from http.server import BaseHTTPRequestHandler
import base64
import urllib.parse
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Handle standard form data
            if self.headers.get('Content-Type') == 'application/x-www-form-urlencoded':
                fields = urllib.parse.parse_qs(post_data.decode('utf-8'))
                filename = fields.get('filename', ['download.bin'])[0]
                data_uri = fields.get('fileData', [''])[0]
            else:
                # Handle JSON if preferred
                data = json.loads(post_data)
                filename = data.get('filename', 'download.bin')
                data_uri = data.get('fileData', '')

            if not data_uri:
                self.send_error(400, "No data")
                return

            header, content = data_uri.split(',', 1)
            mime_type = header.split(':')[1].split(';')[0]
            file_content = base64.b64decode(content)

            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(file_content)
            
        except Exception as e:
            self.send_error(500, str(e))
