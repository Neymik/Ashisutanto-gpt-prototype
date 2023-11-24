
class SpeechToText {

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
    this.recognition.onresult = this.onResult.bind(this);
    this.recognition.onerror = this.onError.bind(this);
    this.recognition.onend = this.onEnd.bind(this);
    this.recognition.start();
  }

  onResult(event) {
    let result = event.results[event.results.length - 1][0].transcript;
    console.log(result);
    if (result === 'stop') {
      this.recognition.stop();
    }
  }

  onError(event) {
    console.log(event);
  }

  onEnd() {
    this.recognition.start();
  }

}

export default SpeechToText;
