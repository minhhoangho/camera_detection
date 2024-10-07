#!/bin/bash

# Start ASGI server
echo "Starting ASGI server..."
daphne -b 0.0.0.0 -p 8086 src.asgi:application &

# Start WSGI server
echo "Starting WSGI server..."
gunicorn --bind 0.0.0.0:8085 src.wsgi:application
