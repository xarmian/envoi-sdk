import { init } from '../index';
import { jest } from '@jest/globals';

describe('integration', () => {
  const sdk = init({
    token: '',
    url: 'https://mainnet-api.voi.nodely.dev',
    port: 443
  });

  const TEST_NAME = 'en.voi';
  const TEST_ADDRESS = 'BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ';

  // These tests interact with the real network and might take longer
  jest.setTimeout(10000);

  describe('chain resolver', () => {
    it('should resolve name to address', async () => {
      const address = await sdk.chain.getAddressFromName(TEST_NAME);
      expect(address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
    });

    it('should resolve address to name', async () => {
      const name = await sdk.chain.getNameFromAddress(TEST_ADDRESS);
      expect(name.toLowerCase()).toBe(TEST_NAME.toLowerCase());
    });
  });

  describe('http resolver', () => {
    it('should resolve name to address', async () => {
      const address = await sdk.http.getAddressFromName(TEST_NAME);
      expect(address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
    });

    it('should resolve address to name', async () => {
      const name = await sdk.http.getNameFromAddress(TEST_ADDRESS);
      expect(name.toLowerCase()).toBe(TEST_NAME.toLowerCase());
    });
  });
}); 