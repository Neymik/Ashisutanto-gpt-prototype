
import { PassThrough } from 'stream';
import prism from 'prism-media';
import Downsampler from './Downsampler.js';
import StereoToMonoConverter from './StereoToMonoConverter.js';
import SilenceGenerator from './SilenceGenerator.js';

class StreamDiscordDecoder {
  constructor(inputAudioStream) {
    this.inputAudioStream = inputAudioStream;
    this.resultOut = new PassThrough();
    this.outputAudioStream = new PassThrough();
    this.outputAudioStream2 = new PassThrough();

    this.tempStream = new PassThrough();

    this.init();
  }

  init() {
    this.opusDecoder = new prism.opus.Decoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });

    const downsampler = new Downsampler(48000, 24000);
    const converter = new StereoToMonoConverter();
    const silenceGenerator = new SilenceGenerator({
      silenceThreshold: 60,
    });

    this.inputAudioStream
      .pipe(this.opusDecoder)
      .pipe(downsampler)
      .pipe(converter)
      .pipe(silenceGenerator)
      .pipe(this.resultOut)

    silenceGenerator.startSilenceInterval();

    let chunkCounter = 0;

    this.resultOut.on('data', (chunk) => {
      // console.log('StreamDiscordDecoder data chunk', chunkCounter++);
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

export default StreamDiscordDecoder;
