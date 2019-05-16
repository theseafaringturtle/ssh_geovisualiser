CLIENT_URL="http://54.36.182.56:3000"
GLOBE_INPUT="/var/log/auth.log"
QUEUE_SIZE=20

if $(sudo test -e $GLOBE_INPUT)
then
	echo "Reading from "$GLOBE_INPUT
	sudo tail -f "/var/log/auth.log" | python3.7 server.py $CLIENT_URL $GLOBE_INPUT $QUEUE_SIZE
else
	echo "Could not find "$GLOBE_INPUT
fi
