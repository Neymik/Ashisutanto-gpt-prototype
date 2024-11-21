
import { createReadStream } from 'fs';
import wav from 'wav';
import Speaker from 'speaker';

class _5PlayAudio {
  constructor({ skip, audioFilePath = './dev_files/_4TextToAudio.wav' }) {
    this.skip = skip;
    this.audioFilePath = audioFilePath;

    this.run();
  }

  async run() {
    if (this.skip) {
      console.log('5 Skipping audio playing.');
      return;
    }

    console.log('5 Play audio');

    this.playWav(this.audioFilePath);

  }

  playWav(filePath) {
    return new Promise((resolve, reject) => {
      // Create a readable stream from the WAV file
      const file = createReadStream(filePath);
  
      // Create a WAV decoder
      const wavReader = new wav.Reader();
  
      // Create a speaker instance
      let speaker;
  
      // When the WAV file's format is known, pipe it to the speaker
      wavReader.on('format', function (format) {
        speaker = new Speaker(format);
        wavReader.pipe(speaker);
      });
  
      // Handle file stream errors
      file.on('error', (err) => {
        reject(`Error reading file: ${err}`);
      });
  
      // Handle wavReader errors
      wavReader.on('error', (err) => {
        reject(`Error decoding WAV file: ${err}`);
      });
  
      // Handle speaker finish event
      speaker?.on('close', () => {
        resolve('Playback finished.');
      });
  
      // Pipe the file stream to the WAV reader
      file.pipe(wavReader);
    });
  }
}

export default _5PlayAudio;
