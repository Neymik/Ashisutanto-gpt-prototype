
import pkg from 'node-record-lpcm16'; // uses sox
import { createWriteStream } from 'fs';

class _1GetAudio {
  constructor({ skip = false, filePath = './dev_files/_1GetAudio.wav' }) {

    this.filePath = filePath;

    if (skip) {
      console.log('1 Skipping audio recording.');
      return;
    }

    this.file = createWriteStream(filePath, { encoding: 'binary' });

    console.log('1 Recording audio... Press Ctrl+C to stop.');
    pkg.record({
      sampleRate: 44100,
      channels: 2,
      // specify other options if necessary
    })
    .stream()
    .pipe(file)
    .on('end', () => {
      console.log('1 Audio recorded.');
      this.file.end();
    });

  }

  async stop() {
    this.file.end();
  }

  async waitUntilDone() {
    return new Promise((resolve, reject) => {
      this.file.on('finish', () => {
        resolve();
      });
    });
  }

}

export default _1GetAudio;
