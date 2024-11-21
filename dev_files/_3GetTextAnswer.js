
import config from '../config/index.js'
import fsp from 'fs/promises';
import axios from 'axios';

class _3GetTextAnswer {
  constructor({ skip, requestFilePath = './dev_files/_2AudioToText.txt', responceFilePath = './dev_files/_3GetTextAnswer.txt' }) {
    this.skip = skip;
    this.requestFilePath = requestFilePath;
    this.responceFilePath = responceFilePath;

    this.run();
  }

  async run() {

    if (this.skip) {
      console.log('3 Skipping text answer.');
      return;
    }
    console.log('3 Get text answer');

    const text = await fsp.readFile(this.requestFilePath, 'utf8');
    const answer = await _3GetTextAnswer.chatComplition(text);
    await fsp.writeFile(this.responceFilePath, answer);
    return answer;

  }

  static async chatComplition(text) {
    
    // openai api gpt4 call
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo-preview",
        messages: [{"role": "user", "content": text}],
        temperature: 0.9, // ?
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openAIKey}`
        }
      }
    );

    const resultText = response.data.choices[0].message.content;
  
    return resultText;
  }

}

export default _3GetTextAnswer;
