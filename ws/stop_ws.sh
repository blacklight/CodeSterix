#!/bin/bash

if [ ! -f "ws.pid" ]
then
    echo "No instance is running, or no file ws.pid found" >&2
    exit 1
fi

PID=`cat ws.pid`
kill $PID
rm ws.pid

