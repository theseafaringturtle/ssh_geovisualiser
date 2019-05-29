#!/bin/bash

CLIENT_URL="http://127.0.0.1:3000"

sudo echo "Starting..."
sudo python3.7 local/local.py | python3.7 start.py $CLIENT_URL

