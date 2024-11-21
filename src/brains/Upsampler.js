
import { Transform } from 'stream';

class Upsampler extends Transform {
  constructor(originalSampleRate, targetSampleRate) {
    super();
    this.originalSampleRate = originalSampleRate;
    this.targetSampleRate = targetSampleRate;
    this.ratio = targetSampleRate / originalSampleRate;
    this.previousSample = 0;
  }

  _transform(chunk, encoding, callback) {
    // Convert incoming chunk to 16-bit PCM samples
    const samples = new Int16Array(chunk.buffer);
    const upsampledLength = Math.floor(samples.length * this.ratio);
    const upsampledData = new Int16Array(upsampledLength);

    // Linear interpolation between samples
    for (let i = 0; i < upsampledLength; i++) {
      const originalIndex = i / this.ratio;
      const index1 = Math.floor(originalIndex);
      const index2 = Math.min(index1 + 1, samples.length - 1);
      const fraction = originalIndex - index1;

      // Get samples for interpolation
      const sample1 = index1 >= 0 ? samples[index1] : this.previousSample;
      const sample2 = samples[index2];

      // Linear interpolation
      upsampledData[i] = Math.round(sample1 + (sample2 - sample1) * fraction);
    }

    // Store last sample for next chunk
    this.previousSample = samples[samples.length - 1];

    // Convert back to buffer and push
    this.push(Buffer.from(upsampledData.buffer));
    callback();
  }
}

export default Upsampler
