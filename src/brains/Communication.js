
import SpeechToText from './SpeechToText.js';
import TextProcessing from './TextProcessing.js';
import TextToSpeech from './TextToSpeech.js';

class Communication {
  constructor() {
    this.speechToText = new SpeechToText();
    this.textProcessing = new TextProcessing();
    this.textToSpeech = new TextToSpeech();

    this.speechToText.onResult = this.onSpeechToTextResult.bind(this);
    this.speechToText.onError = this.onSpeechToTextError.bind(this);
    this.speechToText.onEnd = this.onSpeechToTextEnd.bind(this);

    this.textToSpeech.onEnd = this.onTextToSpeechEnd.bind(this);

    this.speechToText.start();
  }
}

export default Communication;
