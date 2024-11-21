
import { Transform } from 'stream';

class SilenceGenerator extends Transform {
  constructor(options = {}) {
    super(options);
    this.lastDataTime = Date.now();
    this.silenceThreshold = options.silenceThreshold || 500; // ms
    this.sampleRate = options.sampleRate || 24000;
    this.channels = options.channels || 1;
    this.bytesPerSample = options.bytesPerSample || 2; // for 16-bit audio
    
    // Calculate chunk size based on common frame size (e.g., 20ms)
    this.frameSize = Math.floor(this.sampleRate * 0.02); // 20ms frame
    this.chunkSize = this.frameSize * this.channels * this.bytesPerSample;
  }

  _transform(chunk, encoding, callback) {
    this.lastDataTime = Date.now();
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    callback();
  }

  generateSilence() {
    const silenceBuffer = Buffer.alloc(this.chunkSize);
    return silenceBuffer;
  }

  startSilenceInterval() {
    this.silenceInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastDataTime >= this.silenceThreshold) {
        this.push(this.generateSilence());
      }
    }, 20); // Check every 20ms
  }

  stopSilenceInterval() {
    if (this.silenceInterval) {
      clearInterval(this.silenceInterval);
    }
  }
}

export default SilenceGenerator
