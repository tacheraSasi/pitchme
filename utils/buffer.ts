export class PitchMeBuffer {
  private data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  static from(base64: string, encoding: string): PitchMeBuffer {
    if (encoding === "base64") {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new PitchMeBuffer(bytes);
    }
    throw new Error("Unsupported encoding");
  }

  get length(): number {
    return this.data.length;
  }

  readUInt32LE(offset: number): number {
    return (
      (this.data[offset] |
        (this.data[offset + 1] << 8) |
        (this.data[offset + 2] << 16) |
        (this.data[offset + 3] << 24)) >>>
      0
    );
  }

  readInt16LE(offset: number): number {
    const value = this.data[offset] | (this.data[offset + 1] << 8);
    return value > 32767 ? value - 65536 : value;
  }

  slice(start: number, end?: number): PitchMeBuffer {
    return new PitchMeBuffer(this.data.slice(start, end));
  }
}