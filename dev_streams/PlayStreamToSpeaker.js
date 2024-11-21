
import Speaker from 'speaker';

let speaker;

function playAudio(readableStream, { channels = 1, sampleRate = 24000 } = {}) {
  try {
    if (!speaker) {
      speaker = new Speaker({
        channels,
        bitDepth: 16,
        sampleRate,
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

export default playAudio;
