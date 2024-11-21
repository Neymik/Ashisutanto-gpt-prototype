
import { Transform } from 'stream';

class MonoToStereoConverter extends Transform {
  constructor(options = {}) {
    super(options);
    this.bytesPerSample = 2; // 16-bit PCM
  }

  _transform(chunk, encoding, callback) {
    // Each mono sample is 2 bytes, output will be 4 bytes (stereo)
    if (chunk.length % 2 !== 0) {
      callback(new Error('Invalid chunk size for mono audio'));
      return;
    }

    // Create buffer for stereo output (double the size of input)
    const stereoBuffer = Buffer.alloc(chunk.length * 2);
    
    // Process each mono sample
    for (let i = 0; i < chunk.length; i += 2) {
      const monoSample = chunk.readInt16LE(i);
      
      // Write the same sample to both left and right channels
      stereoBuffer.writeInt16LE(monoSample, i * 2);       // Left channel
      stereoBuffer.writeInt16LE(monoSample, i * 2 + 2);   // Right channel
    }

    this.push(stereoBuffer);
    callback();
  }
}

export default MonoToStereoConverter
