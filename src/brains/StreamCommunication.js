
import { PassThrough } from 'stream';
import prism from 'prism-media';
import Speaker from 'speaker';

class StreamCommunication {
  constructor(inputAudioStream) {
    this.inputAudioStream = inputAudioStream;
    this.middleAudioStream = new PassThrough();
    this.outputAudioStream = new PassThrough();
    this.tempStream = new PassThrough();

    this.init();
  }

  async init() {

    this.speaker = new Speaker({
      channels: 2,          // 2 channels (stereo)
      bitDepth: 16,         // 16-bit samples
      sampleRate: 48000     // Discord uses 48kHz audio
    });

    this.opusDecoder = new prism.opus.Decoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });
    // console.log('opusDecoder', this.opusDecoder)

    this.inputAudioStream
      .pipe(this.opusDecoder)
      .pipe(this.middleAudioStream)
    

    this.middleAudioStream.on('data', (chunk) => {
      console.log('chunk');
      this.outputAudioStream.write(chunk);
      this.speaker.write(chunk);

      this.tempStream.write(chunk);
    });
  
    this.middleAudioStream.on('end', () => {
      this.outputAudioStream.end();
      this.speaker.end();

      this.tempStream.end();
    });

    this.inputAudioStream.on('end', () => {
      console.log('inputAudioStream end called');
      this.outputAudioStream.end();
      this.tempStream.end();
    });

  }

  getNewTempStream() {
    this.tempStream = new PassThrough();
    return this.tempStream;
  }

}

export default StreamCommunication;
