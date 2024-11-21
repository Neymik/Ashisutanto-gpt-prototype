
import config from '../config/index.js'
import { createWriteStream } from 'fs';
import fsp from 'fs/promises';
import axios from 'axios';



class _4TextToAudio {
  constructor({ skip, textFilePath = './dev_files/_3GetTextAnswer.txt', audioFilePath = './dev_files/_4TextToAudio.wav' }) {
    this.skip = skip;
    this.textFilePath = textFilePath;
    this.audioFilePath = audioFilePath;

    this.run();

  }

  async run() {
    if (this.skip) {
      console.log('4 Skipping text to audio.');
      return;
    }
    console.log('4 Text to audio');

    const text = await fsp.readFile(this.textFilePath, 'utf8');
    const answer = await this.textToAudio(text);
    return answer;

  }

  async textToAudio(text) {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: "tts-1",
        input: text,
        voice: "alloy",
        response_format: "wav"
      },
      {
        responseType: 'stream',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openAIKey}`
        }
      }
    );

    this.file = createWriteStream(this.audioFilePath, { encoding: 'binary' });
    response.data.pipe(this.file);

    return this.audioFilePath;
  }


}

export default _4TextToAudio;
