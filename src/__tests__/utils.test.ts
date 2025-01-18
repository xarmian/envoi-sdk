import { isVoiAddress, stripNullBytes, uint8ArrayToBigInt, bigIntToUint8Array } from '../utils';

describe('utils', () => {
  describe('isVoiAddress', () => {
    it('should return true for valid Voi addresses', () => {
      const validAddress = 'TBEIGCNK4UCN3YDP2NODK3MJHTUZMYS3TABRM2MVSI2MPUR2V36E5JYHSY';
      expect(isVoiAddress(validAddress)).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      const invalidAddresses = [
        '',
        'too-short',
        'INVALID!ADDRESS',
        'TBEIGCNK4UCN3YDP2NODK3MJHTUZMYS3TABRM2MVSI2MPUR2V36E5JYHS', // Too short
        'TBEIGCNK4UCN3YDP2NODK3MJHTUZMYS3TABRM2MVSI2MPUR2V36E5JYHSYY' // Too long
      ];

      invalidAddresses.forEach(addr => {
        expect(isVoiAddress(addr)).toBe(false);
      });
    });
  });

  describe('stripNullBytes', () => {
    it('should remove null bytes from strings', () => {
      const input = 'test\0string\0with\0nulls\0';
      expect(stripNullBytes(input)).toBe('teststringwithnulls');
    });

    it('should return the same string if no null bytes', () => {
      const input = 'normal string';
      expect(stripNullBytes(input)).toBe(input);
    });
  });

  describe('uint8ArrayToBigInt', () => {
    it('should convert Uint8Array to BigInt', () => {
      const input = new Uint8Array([1, 2, 3, 4]);
      const expected = BigInt('0x01020304');
      expect(uint8ArrayToBigInt(input)).toBe(expected);
    });

    it('should handle empty array', () => {
      const input = new Uint8Array([]);
      expect(uint8ArrayToBigInt(input)).toBe(BigInt(0));
    });
  });

  describe('bigIntToUint8Array', () => {
    it('should convert BigInt to Uint8Array', () => {
      const input = BigInt('0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20');
      const expected = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
      ]);
      expect(bigIntToUint8Array(input)).toEqual(expected);
    });

    it('should pad small numbers with zeros', () => {
      const input = BigInt(1);
      const result = bigIntToUint8Array(input);
      expect(result.length).toBe(32);
      expect(result[31]).toBe(1);
      expect(result.slice(0, 31).every(byte => byte === 0)).toBe(true);
    });

    it('should handle zero', () => {
      const input = BigInt(0);
      const result = bigIntToUint8Array(input);
      expect(result.length).toBe(32);
      expect(result.every(byte => byte === 0)).toBe(true);
    });
  });
}); 