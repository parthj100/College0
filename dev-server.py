#!/usr/bin/env python3
"""Static dev server for College0.

Wraps http.server with Cache-Control: no-store on every response so reloads
always pull fresh JS/CSS/HTML. The CACHE_BUST query strings inside College0.html
become decorative — you don't have to bump them between edits anymore.

Usage:
  python3 dev-server.py [port] [directory]

Defaults: port 8421, directory ./project.
"""
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8421
    directory = sys.argv[2] if len(sys.argv) > 2 else "project"

    if directory and os.path.isdir(directory):
        os.chdir(directory)

    print(f"College0 dev server: http://localhost:{port}/College0.html (dir={os.getcwd()})")
    HTTPServer(("", port), NoCacheHandler).serve_forever()


if __name__ == "__main__":
    main()
