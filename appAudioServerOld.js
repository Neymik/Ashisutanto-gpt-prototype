
import net from 'net';
import { PassThrough, Transform } from 'stream';
import RealTimeAPI from './src/brains/RealTimeAPI.js'

function setupAudioStream() {
  const server = net.createServer((socket) => {
    console.log('Client connected');

    // Create streams for input and output
    const inputAudioStream = new PassThrough();

    // Pipe incoming data to inputAudioStream
    socket.pipe(inputAudioStream);

    // Process the audio stream
    const outputAudioStream = processStream(inputAudioStream);

    // Pipe the processed audio back to Asterisk
    outputAudioStream.pipe(socket);

    socket.on('end', () => {
      console.log('Client disconnected');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  server.listen(10500, '0.0.0.0', () => {
    console.log('Audio server listening on port 10500');
  });  
}

function processStream(inputStream) {
  // Example: A simple passthrough that could modify the audio
  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      // Modify the audio chunk here (e.g., apply effects)
      // For now, we'll just pass it through
      this.push(chunk);
      callback();
    },
  });

  // Pipe the input stream through the transform
  return inputStream.pipe(transformStream);
}

setupAudioStream();
