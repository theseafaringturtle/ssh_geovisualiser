#!/bin/bash

CLIENT_URL="http://54.36.182.56:3000"
GLOBE_INPUT="/var/log/auth.log"

if [ ! -f ./pipe ]
then
rm  pipe
fi
mkfifo pipe

if $(sudo test -e $GLOBE_INPUT)
then
	python3.7 server.py $CLIENT_URL < pipe &
	echo "Reading from "$GLOBE_INPUT
	sudo cat $GLOBE_INPUT > pipe
	sudo tail -f $GLOBE_INPUT > pipe
	kill $!
	kill $!
else
	echo "Could not find "$GLOBE_INPUT
fi
