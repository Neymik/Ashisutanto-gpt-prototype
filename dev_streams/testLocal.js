
import { createReadStream, createWriteStream } from 'fs';
import StreamCommunication from '../src/brains/StreamCommunication.js'
import wav from 'wav';

async function init() {

  const inputFilePath = './dev_streams/testAudioInput.wav';
  const outputFilePath = './dev_streams/testAudioOutput.wav'
  
  const inputAudioStream = createReadStream(inputFilePath);
  const streamCommunication = new StreamCommunication(inputAudioStream);
  const outputAudioStream = streamCommunication.outputAudioStream;

  const fileWriter = new wav.FileWriter(outputFilePath, {
    channels: 1,
    sampleRate: 44100,
    bitDepth: 32
  });

  outputAudioStream.pipe(fileWriter);

  fileWriter.on('finish', () => {
    console.log('WAV file has been written.');
  });

  process.on('SIGINT', () => {
    try {
      getAudio.file.end();
    } catch (error) {
      // console.error(error);
    }
  
    console.log('App stopped.');
    process.exit();
  });

}

init();
