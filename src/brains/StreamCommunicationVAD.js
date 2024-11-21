
import { PassThrough } from 'stream';

import VAD from 'node-vad';
const vad = new VAD(VAD.Mode.NORMAL);

const notSpeechChunksLimit = 10;

class StreamCommunication {
  constructor(inputAudioStream) {
    this.inputAudioStream = inputAudioStream;
    this.outputAudioStream = new PassThrough();

    this.init();
  }

  async init() {
    this.inputAudioStream.on('data', async (chunk) => {
      let isSpeechStarted = false;
      let notSpeechChunks = 0;

      const isSpeech = await this.isSpeech(chunk);

      if (isSpeech) {
        isSpeechStarted = true;
        notSpeechChunks = 0;
      } else {
        notSpeechChunks++;
      }

      if (isSpeechStarted) {
        this.outputAudioStream.write(chunk);
      }

      if (notSpeechChunks > notSpeechChunksLimit) { // speech ended
        isSpeechStarted = false;
        this.outputAudioStream.end();
        this.outputAudioStream = new PassThrough();
      }
    });

    this.inputAudioStream.on('end', () => {
      this.outputAudioStream.end();
    });
  }

  async isSpeech(chunk) {
    const res = await vad.processAudio(chunk, 16000);

    switch (res) {
      case VAD.Event.ERROR:
        console.log("ERROR");
        return false;
      case VAD.Event.NOISE:
        console.log("NOISE");
        return false;
      case VAD.Event.SILENCE:
        console.log("SILENCE");
        return false;
      case VAD.Event.VOICE:
        console.log("VOICE");
        return true;
      default:
        console.log("default");
        return false;
    }
  }
}

export default StreamCommunication;
