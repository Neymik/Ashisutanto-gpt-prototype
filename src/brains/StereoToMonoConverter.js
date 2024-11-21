
import { Transform } from 'stream';

class StereoToMonoConverter extends Transform {
  constructor(options = {}) {
    super(options);
    // Assuming 16-bit PCM audio
    this.bytesPerSample = 2;
  }

  _transform(chunk, encoding, callback) {
    // Each stereo sample consists of 2 channels * 2 bytes per sample = 4 bytes
    if (chunk.length % 4 !== 0) {
      callback(new Error('Invalid chunk size for stereo audio'));
      return;
    }

    // Create buffer for mono output (half the size of input)
    const monoBuffer = Buffer.alloc(chunk.length / 2);
    
    // Process each stereo sample pair
    for (let i = 0; i < chunk.length; i += 4) {
      // Convert bytes to 16-bit samples
      const leftChannel = chunk.readInt16LE(i);
      const rightChannel = chunk.readInt16LE(i + 2);
      
      // Average the two channels
      // Note: We divide by 2 to prevent clipping
      const monoSample = Math.round((leftChannel + rightChannel) / 2);
      
      // Write the mono sample to the output buffer
      monoBuffer.writeInt16LE(monoSample, i / 2);
    }

    this.push(monoBuffer);
    callback();
  }
}

export default StereoToMonoConverter
