
import config from '../config/index.js'
import axios from 'axios';
import fs from 'fs';
import fsp from 'fs/promises';


class _2AudioToText {

  constructor({ skip = false, audioFilePath = './dev_files/_1GetAudio.wav', textFilePath = './dev_files/_2AudioToText.txt' }) {
    this.skip = skip;
    this.audioFilePath = audioFilePath;
    this.textFilePath = textFilePath;

    this.run();
  }

  async run() {
    if (this.skip) {
      console.log('2 Skipping audio transcription.');
      const text = await fsp.readFile(this.textFilePath, 'utf8');
      return text;
    }
    console.log('2 Audio to text');

    const text = await _2AudioToText.transcribeAudio(this.audioFilePath);
    await fsp.writeFile(this.textFilePath, text);
    return text;

  }

  static async transcribeAudio(audioFilePath) {
    
    const file = fs.createReadStream(audioFilePath);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        file,
        model: 'whisper-1',
        'response_format': 'text'
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${config.openAIKey}`
        }
      }
    );

    const resultText = response.data;
  
    return resultText;
  }

}

export default _2AudioToText;
