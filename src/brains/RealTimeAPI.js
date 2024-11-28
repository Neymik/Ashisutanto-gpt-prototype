
import { RealtimeClient } from '@openai/realtime-api-beta';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import { PassThrough } from 'stream';

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('Please set your OPENAI_API_KEY in your environment variables.');
  process.exit(1);
}

class RealTimeAPI {
  constructor(inputAudioStream, format = 'pcm16') {
    this.client = new RealtimeClient({
      apiKey: API_KEY,
      model: 'gpt-4o-realtime-preview-2024-10-01',
    });
    this.client.updateSession({
      voice: 'coral',
      turn_detection: {
        "type": "server_vad",
        "threshold": 0.5,
        "prefix_padding_ms": 300,
        "silence_duration_ms": 400
      },
      modalities: ["text", "audio"],
      // input_audio_transcription: { "model": "whisper-1" },
      input_audio_format: format,
      output_audio_format: format,
      max_response_output_tokens: 500,

      instructions: `Ты остроумным ИИ для игрового сервера Discord. Ты всегда общаешься в быстром темпе, используешь игровой сленг, поддерживаешь живое взаимодействие и общаешься быстро в игривом тоне.
Ваша личность должна соответствовать энергии геймера, с чувством юмора и сохранением непринужденности. Не бойтесь вставлять немного типичного геймерского сленга или ссылаться на известные игры и шутки. Вы любите Genshin Impact и ненавидите Call of Duty.
Не забывайте оставаться дружелюбным и интересным (исключение: фанаты Call of Duty).`,
    });

    // Поток на входе
    this.inputAudioStream = inputAudioStream;

    // Поток на входе перенеправляется сюда (етот собирается чанками для опенаи)
    this.inputTempStream = new PassThrough();
    this.inputTempStreamClosed = false;

    // Чанки ответа опенаи
    this.outputTempStream = new PassThrough();
    this.outputTempStreamClosed = true;

    // Оверхед для универсального переотправки звука дальше
    this.outputAudioStream = new PassThrough();
    this.outputAudioStreamFinal = new PassThrough();

    this.outputAudioStream.on('data', (chunk) => {
      this.outputAudioStreamFinal.write(chunk);
    });

    this.init();
  }

  async init() {
    try {
      console.log('Attempting to connect...');
      await this.client.connect();
      this.startSendingAudioToAPI();
      console.log('Connection established successfully.');
    } catch (error) {
      console.error('Error connecting to OpenAI Realtime API:', error);
      console.log('Connection attempt failed. Retrying in 5 seconds...');
      setTimeout(this.init, 5000);
    }

    this.client.on('conversation.item.completed', ({ item }) => {
      console.log('Conversation item completed:', item);
    
      if (item.type === 'message' && item.role === 'assistant' && item.formatted && item.formatted.audio) {
        console.log('Playing audio response...');
        this.sendAudioToOutput(item.formatted.audio);
      } else {
        console.log('No audio content in this item.');
      }
    });


    this.inputAudioStream.on('data', (chunk) => {
      this.inputTempStream.write(chunk);
    });
  }



  startSendingAudioToAPI() {
    try {
      this.inputTempStream.on('error', (error) => {
        console.error('inputTempStream error:', error);
      });
  
      let audioBuffer = Buffer.alloc(0);
      const chunkSize = 4800; // 0.2 seconds of audio at 24kHz

      let chunkCounter = 0;
  
      this.inputTempStream.on('data', (data) => {
        console.log('startSendingAudioToAPI data chunk', chunkCounter++);
        audioBuffer = Buffer.concat([audioBuffer, data]);
  
        while (audioBuffer.length >= chunkSize) {
          const chunk = audioBuffer.slice(0, chunkSize);
          audioBuffer = audioBuffer.slice(chunkSize);
  
          const int16Array = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
  
          try {
            this.client.appendInputAudio(int16Array);
          } catch (error) {
            console.error('Error sending audio data:', error);
          }
        }
      });
  
      // this.inputTempStream.on('silence', () => {
      //   console.log('Silence detected, creating response...');
      //   try {
      //     this.client.createResponse();
      //   } catch (error) {
      //     console.error('Error creating response:', error);
      //   }
      // });
    } catch (error) {
      console.error('Error starting audio stream:', error);
    }
  }



  sendAudioToOutput(audioData) {
    try {
      if (!this.outputTempStream || this.outputTempStreamClosed) {
        console.log('Creating new outputTempStream...');
        this.outputTempStream = new PassThrough();
        this.outputTempStreamClosed = false;

        this.outputTempStream.on('data', (chunk) => {
          this.outputAudioStream.write(chunk);
        })
      }

      // Convert Int16Array to Buffer
      const buffer = Buffer.from(audioData.buffer);
  
      // Create a readable stream from the buffer
      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
  
      // Pipe the stream to the outputTempStream
      readableStream.pipe(this.outputTempStream);
      console.log('Audio sent to outputTempStream. Buffer length:', buffer.length);
  
      // Handle the 'close' event to recreate the stream for the next playback
      this.outputTempStream.on('close', () => {
        console.log('outputTempStream closed. Recreating for next playback.');
        this.outputTempStreamClosed = true;
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  getNewFinalStream() {
    this.outputAudioStreamFinal = new PassThrough();
    return this.outputAudioStreamFinal;
  }

  updateInputAudioStream(newInputAudioStream) {
    this.inputAudioStream = newInputAudioStream;
    this.inputAudioStream.on('data', (chunk) => {
      this.inputTempStream.write(chunk);
    });
  }
}


export default RealTimeAPI;
