import dgram from 'dgram'; // Import the dgram module
import RTP from 'rtp-parser';

const PORT = 10500; // Specify the port
const HOST = '127.0.0.1'; // Specify the host (localhost)

// Create a UDP socket
const server = dgram.createSocket('udp4');

// Handle incoming messages
server.on('message', (msg, rinfo) => {
  console.log(`Server received: ${msg} from ${rinfo.address}:${rinfo.port}`);

  try {
    // Parse the incoming RTP packet
    const packet = RTP.RTPPacket.parse(msg);
    console.log(`Received RTP packet with sequence number ${packet.header.sequenceNumber}`);

    // Process the audio payload
    const audioData = packet.payload;

    // Optionally modify the audioData here

    // Send the modified audio back to Asterisk
    const responsePacket = RTP.RTPPacket.serialize({
      header: {
        payloadType: packet.header.payloadType,
        sequenceNumber: packet.header.sequenceNumber + 1,
        timestamp: packet.header.timestamp + 160, // Assuming 20ms frames
        ssrc: packet.header.ssrc,
      },
      payload: audioData,
    });

    server.send(responsePacket, 0, responsePacket.length, rinfo.port, rinfo.address, (err) => {
      if (err) console.error('Error sending response:', err);
    });
  } catch (error) {
    console.error('Error parsing incoming RTP packet:', error);
    server.send('you sent message ' + msg, 0, 'you sent message '.length + msg.length, rinfo.port, rinfo.address, (err) => {
      if (err) console.error('Error sending response:', err);
    });
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

// Start the server
server.bind(PORT, HOST, () => {
  console.log(`UDP server listening on ${HOST}:${PORT}`);
});
