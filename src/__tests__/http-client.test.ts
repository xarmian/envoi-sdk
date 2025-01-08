import { createHttpClient } from '../http-client';
import { API_BASE_URL } from '../config';
import { jest } from '@jest/globals';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('http-client', () => {
  let client: ReturnType<typeof createHttpClient>;

  const TEST_NAME = 'en.voi';
  const TEST_ADDRESS = 'BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ';

  beforeEach(() => {
    client = createHttpClient();
    mockFetch.mockClear();
  });

  describe('getNameFromAddress', () => {
    it('should return name for valid address', async () => {
      const mockResponse = {
        results: [{
          address: 'TESTADDRESS',
          type: 'addr',
          name: 'test.voi',
          metadata: {},
          cached: false
        }]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getNameFromAddress('TESTADDRESS');
      expect(result).toBe('test.voi');
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/name/TESTADDRESS`,
        expect.any(Object)
      );
    });

    it('should return empty string for failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await client.getNameFromAddress('TESTADDRESS');
      expect(result).toBe('');
    });

    it('should correctly parse en.voi address response', async () => {
      const mockResponse = {
        results: [{
          address: TEST_ADDRESS,
          type: 'addr',
          name: TEST_NAME,
          metadata: {},
          cached: false
        }]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getNameFromAddress(TEST_ADDRESS);
      expect(result.toLowerCase()).toBe(TEST_NAME.toLowerCase());
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/name/${TEST_ADDRESS}`,
        expect.any(Object)
      );
    });
  });

  describe('getAddressFromName', () => {
    it('should return address for valid name', async () => {
      const mockResponse = {
        results: [{
          name: 'test.voi',
          address: 'TESTADDRESS',
          metadata: {},
          cached: false
        }]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getAddressFromName('test.voi');
      expect(result).toBe('TESTADDRESS');
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/address/test.voi`,
        expect.any(Object)
      );
    });

    it('should return empty string for failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await client.getAddressFromName('test.voi');
      expect(result).toBe('');
    });

    it('should correctly parse en.voi name response', async () => {
      const mockResponse = {
        results: [{
          name: TEST_NAME,
          address: TEST_ADDRESS,
          metadata: {},
          cached: false
        }]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getAddressFromName(TEST_NAME);
      expect(result.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/address/${TEST_NAME}`,
        expect.any(Object)
      );
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockResponse = {
        results: [
          {
            name: 'test.voi',
            address: 'TESTADDRESS1',
            metadata: { avatar: 'test1.jpg' },
            cached: false
          },
          {
            name: 'test2.voi',
            address: 'TESTADDRESS2',
            metadata: { avatar: 'test2.jpg' },
            cached: false
          }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const results = await client.search('test');
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        name: 'test.voi',
        address: 'TESTADDRESS1',
        metadata: { avatar: 'test1.jpg' }
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/search?pattern=test`,
        expect.any(Object)
      );
    });

    it('should return empty array for failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const results = await client.search('test');
      expect(results).toEqual([]);
    });

    it('should handle empty results', async () => {
      const mockResponse = { results: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const results = await client.search('nonexistent');
      expect(results).toEqual([]);
    });
  });
}); 