import AriClient from 'ari-client';

import dgram from 'dgram';
import RTP from 'rtp-parser';

async function connectToAri() {
  try {
    // Ensure Asterisk is configured to allow this connection
    const client = await AriClient.connect(
      'http://localhost:8088/ari', 
      'asterisk_api', 
      'your_secret_password'
    );


    console.log('Connected to ARI successfully');

    // Start of Stasis application
    client.on('StasisStart', async (event, channel) => {
      console.log('StasisStart event received:', channel.id, channel.dialplan.app_data);

      try {
        if (channel.dialplan.app_data == 'webrtc-app') {
          // await channel.answer();

          // const inputAudioStream = channel.receiver.subscribe(channel.id);

          // const streamRealTimeAPI = new RealTimeAPI(inputAudioStream, 'g711_ulaw');
          // const streamRealTimeOutput = streamRealTimeAPI.getNewFinalStream();
          
          const externalChannel = await client.channels.externalMedia({
            app: 'node-audio-server', // Replace with your ARI app name 
            external_host: 'host.docker.internal:10500', // Node.js server address // host.docker.internal 172.17.0.1
            format: 'ulaw',
            connection_type: 'client', // client | server

            encapsulation: 'rtp',
            transport: 'udp',
            direction: 'both'
          });

          // console.log('externalChannel', externalChannel);
          // console.log('channel.channelvars', channel.channelvars);
          console.log('externalChannel.channelvars', externalChannel.channelvars); // UNICASTRTP_LOCAL_PORT

          // connectToUDPAudioServer('127.0.0.1', externalChannel.channelvars.UNICASTRTP_LOCAL_PORT);

          // console.log('channel', await channel.externalMedia('node-audio-server'))

          // Create a mixing bridge
          const bridge = await client.bridges.create({ type: 'mixing' });
          await bridge.addChannel({ channel: channel.id });
          await bridge.addChannel({ channel: externalChannel.id });

          console.log('bridge', bridge);

        }

      } catch (err) {
          console.error('Call handling error:', err);
      }
    });

    client.on('error', (err) => {
      console.error('ARI Error:', err);
    });

    client.on('disconnect', () => {
      console.log('Disconnected from ARI - attempting to reconnect...');
      setTimeout(connectToAsterisk, 3000); // Reconnect after 3 seconds
    });

    client.on('WebSocketOpened', () => {
      console.log('WebSocket connection opened');
    });
    client.on('WebSocketClosed', () => {
      console.log('WebSocket connection closed');
    });

    // Create WebSocket connection for the application
    client.start('webrtc-app');
    client.start('node-audio-server');

    console.log('Listening for calls...');

  } catch (err) {
      console.error('ARI Connection Error:', err);
  }
}


async function connectToUDPAudioServer(asteriskIp, asteriskPort) {
  const socket = dgram.createSocket('udp4');

  socket.on('error', (err) => {
    console.error(`Socket error:\n${err.stack}`);
    socket.close();
  });

  socket.on('message', (msg, rinfo) => {
    // Parse the RTP packet
    const packet = RTP.RTPPacket.parse(msg);
    console.log(`Received RTP packet with sequence number ${packet.header.sequenceNumber}`);
    // Process the audio data (packet.payload)
  });

  socket.on('close', () => {
    console.log('Socket closed');
  });

  // Since UDP is connectionless, you can start sending data immediately
  // For demonstration, we'll send an empty packet to initiate communication
  const initialPacket = Buffer.alloc(0);
  socket.send(initialPacket, 0, initialPacket.length, asteriskPort, asteriskIp, (err) => {
    if (err) {
      console.error('Error sending initial packet:', err);
    } else {
      console.log(`Connected to Asterisk at ${asteriskIp}:${asteriskPort}`);
    }
  });

  // Keep the socket open to receive RTP packets
}


// Run the connection
connectToAri();
