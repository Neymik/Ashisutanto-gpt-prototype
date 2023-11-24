
class TextProcessing {

  constructor() {
    this.onResult = null;
    this.onError = null;
    this.onEnd = null;

    this.process = this.process.bind(this);
  }

  process(text) {
    if (this.onResult) {
      this.onResult(text);
    }
  }

}

export default TextProcessing;
