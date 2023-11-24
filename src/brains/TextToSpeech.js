
class TextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = this.synth.getVoices();
    this.voice = this.voices[0];
    this.pitch = 1;
    this.rate = 1;
    this.text = '';
    this.speak = this.speak.bind(this);
    this.setVoice = this.setVoice.bind(this);
    this.setPitch = this.setPitch.bind(this);
    this.setRate = this.setRate.bind(this);
    this.setText = this.setText.bind(this);
  }

  speak() {
    const utterance = new SpeechSynthesisUtterance(this.text);
    utterance.voice = this.voice;
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;
    this.synth.speak(utterance);
  }

  setVoice(voice) {
    this.voice = voice;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  setRate(rate) {
    this.rate = rate;
  }

  setText(text) {
    this.text = text;
  }
}

export default TextToSpeech;
