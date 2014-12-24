#!/bin/bash

if [ -f "ws.pid" ]
then
    echo "An instance is already running - if not, please delete the file ws.pid" >&2
    exit 1
fi

node server.js 2>../log/ws_error.log &
PID=$!
echo $PID > ws.pid

