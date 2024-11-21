
import { PassThrough } from 'stream';
import Upsampler from './Upsampler.js';
import MonoToStereoConverter from './MonoToStereoConverter.js';

class StreamDiscordEncoder {
  constructor(inputAudioStream) {
    this.inputAudioStream = inputAudioStream;
    this.resultOut = new PassThrough();
    this.outputAudioStream = new PassThrough();
    this.outputAudioStream2 = new PassThrough();
    this.tempStream = new PassThrough();

    this.init();
  }

  init() {
    const sampler = new Upsampler(24000, 48000);
    const converter = new MonoToStereoConverter();

    this.inputAudioStream
      .pipe(sampler)
      .pipe(converter)
      .pipe(this.resultOut)


    this.resultOut.on('data', (chunk) => {
      this.outputAudioStream.write(chunk);
      this.outputAudioStream2.write(chunk);

      this.tempStream.write(chunk);
    });
  
    this.resultOut.on('end', () => {
      this.outputAudioStream.end();
      this.outputAudioStream2.end();

      this.tempStream.end();
    });

    this.inputAudioStream.on('end', () => {
      this.resultOut.end();
      this.outputAudioStream.end();
      this.outputAudioStream2.end();

      this.tempStream.end();
    });

  }

  getNewTempStream() {
    this.tempStream = new PassThrough();
    return this.tempStream;
  }

}

export default StreamDiscordEncoder;
