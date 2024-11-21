
import { Transform } from 'stream';

class Downsampler extends Transform {
  constructor(originalSampleRate, targetSampleRate) {
    super();
    this.originalSampleRate = originalSampleRate;
    this.targetSampleRate = targetSampleRate;
    this.ratio = originalSampleRate / targetSampleRate;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    // Convert incoming chunk to 16-bit PCM samples
    const samples = new Int16Array(chunk.buffer);
    const downsampledLength = Math.floor(samples.length / this.ratio);
    const downsampledData = new Int16Array(downsampledLength);

    // Simple downsampling by picking every Nth sample
    for (let i = 0; i < downsampledLength; i++) {
      const originalIndex = Math.floor(i * this.ratio);
      downsampledData[i] = samples[originalIndex];
    }

    // Convert back to buffer and push
    this.push(Buffer.from(downsampledData.buffer));
    callback();
  }
}

export default Downsampler
