import { isVoiAddress, stripNullBytes, uint8ArrayToBigInt } from '../utils';

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
}); 