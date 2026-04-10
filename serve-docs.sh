#!/bin/bash

# Serve the docs folder for the resolver map visualization
cd "$(dirname "$0")/docs"
echo "Serving docs directory at http://localhost:8000"
echo "Open http://localhost:8000/resolver-map.html in your browser"
echo ""
echo "Note: To view code snippets in resolver flows, use the advanced server instead:"
echo "  python3 ../serve-docs-advanced.py"
echo ""
echo "Press Ctrl+C to stop"

python3 -m http.server 8000
