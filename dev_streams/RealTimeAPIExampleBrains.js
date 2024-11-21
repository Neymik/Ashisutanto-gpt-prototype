
import mic from 'mic';
import Speaker from 'speaker';

import RealTimeAPI from '../src/brains/RealTimeAPI.js'


let micInstance;
let speaker;

async function main() {
  const audioStream = startAudioStream();
  const streamCommunication = new RealTimeAPI(audioStream);
  const tempStream = streamCommunication.getNewFinalStream();
  playAudio(tempStream);
}

main();


// BEGIN MANAGE Mac AUDIO INTERFACES

function startAudioStream() {
  try {
    micInstance = mic({
      rate: '24000',
      channels: '1',
      debug: false,
      exitOnSilence: 6,
      fileType: 'raw',
      encoding: 'signed-integer',
    });

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('error', (error) => {
      console.error('Microphone error:', error);
    });

    micInstance.start();
    console.log('Microphone started streaming.');

    return micInputStream;

  } catch (error) {
    console.error('Error starting audio stream:', error);
  }
}

function playAudio(readableStream) {
  try {
    if (!speaker) {
      speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 24000,
      });
    }

    readableStream.pipe(speaker);
    console.log('Audio sent to speaker for playback.');

    // Handle the 'close' event to recreate the speaker for the next playback
    speaker.on('close', () => {
      console.log('Speaker closed. Recreating for next playback.');
      speaker = null;
    });
  } catch (error) {
    console.error('Error playing audio:', error);
  }
}

// END MANAGE AUDIO INTERFACES