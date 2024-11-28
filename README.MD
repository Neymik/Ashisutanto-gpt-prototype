
john.doe@asterisk.docker.localhost:5060
password

tail /var/log/asterisk/full

wscat -c "ws://localhost:8088/ari/events?api_key=asterisk_api:your_secret_password&app=webrtc-app"

ast_tls_cert -C example.com -O "ADMP" -d /Users/neymik/Documents/Ashisutanto-gpt-prototype/asterisk-keys


# asterisk logs
asterisk -rvvvvvv
core set verbose 5
core set debug 5
rtp set debug on


apk add tcpdump
apk add netcat-openbsd
tcpdump -i any udp port 10500
sudo sngrep -R
sudo tcpdump -i any udp portrange 10000-20000

(_ws.col.protocol == "UDP") && !(_ws.col.info contains "443")

echo "Hello, server" | nc -u host.docker.internal 10500

