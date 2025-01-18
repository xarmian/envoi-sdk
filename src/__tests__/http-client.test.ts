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
      expect(result).toEqual(['test.voi']);
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
      expect(result).toEqual(['']);
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
      expect(result[0].toLowerCase()).toBe(TEST_NAME.toLowerCase());
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/name/${TEST_ADDRESS}`,
        expect.any(Object)
      );
    });

    it('should handle multiple addresses', async () => {
      const mockResponse = {
        results: [
          {
            address: 'TESTADDRESS1',
            name: 'test1.voi',
            metadata: {},
            cached: false
          },
          {
            address: 'TESTADDRESS2',
            name: 'test2.voi',
            metadata: {},
            cached: false
          }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getNameFromAddress(['TESTADDRESS1', 'TESTADDRESS2']);
      expect(result).toEqual(['test1.voi', 'test2.voi']);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/name/TESTADDRESS1,TESTADDRESS2`,
        expect.any(Object)
      );
    });

    it('should return array of empty strings for failed request with multiple addresses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await client.getNameFromAddress(['TESTADDRESS1', 'TESTADDRESS2']);
      expect(result).toEqual(['', '']);
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
      expect(result).toEqual(['TESTADDRESS']);
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
      expect(result).toEqual(['']);
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
      expect(result[0].toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/address/${TEST_NAME}`,
        expect.any(Object)
      );
    });

    it('should handle multiple names', async () => {
      const mockResponse = {
        results: [
          {
            name: 'test1.voi',
            address: 'TESTADDRESS1',
            metadata: {},
            cached: false
          },
          {
            name: 'test2.voi',
            address: 'TESTADDRESS2',
            metadata: {},
            cached: false
          }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getAddressFromName(['test1.voi', 'test2.voi']);
      expect(result).toEqual(['TESTADDRESS1', 'TESTADDRESS2']);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/address/test1.voi,test2.voi`,
        expect.any(Object)
      );
    });

    it('should return array of empty strings for failed request with multiple names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await client.getAddressFromName(['test1.voi', 'test2.voi']);
      expect(result).toEqual(['', '']);
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

  describe('getTokenInfo', () => {
    const TEST_TOKEN_ID = '80067632360305829899847207196844336417360777167721505904064743996533051131418';
    const TEST_TOKEN_ID_2 = '80067632360305829899847207196844336417360777167721505904064743996533051131419';
    
    it('should return token info for valid token ID', async () => {
      const mockResponse = {
        results: [{
          token_id: TEST_TOKEN_ID,
          name: 'test.voi',
          address: 'TESTADDRESS',
          metadata: { url: 'https://example.com' },
          cached: false
        }]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getTokenInfo(TEST_TOKEN_ID);
      expect(result).toEqual([{
        token_id: TEST_TOKEN_ID,
        name: 'test.voi',
        address: 'TESTADDRESS',
        metadata: { url: 'https://example.com' }
      }]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/token/${TEST_TOKEN_ID}?avatar=thumb`,
        expect.any(Object)
      );
    });

    it('should handle multiple token IDs', async () => {
      const mockResponse = {
        results: [
          {
            token_id: TEST_TOKEN_ID,
            name: 'test1.voi',
            address: 'TESTADDRESS1',
            metadata: { url: 'https://example1.com' },
            cached: false
          },
          {
            token_id: TEST_TOKEN_ID_2,
            name: 'test2.voi',
            address: 'TESTADDRESS2',
            metadata: { url: 'https://example2.com' },
            cached: false
          }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getTokenInfo([TEST_TOKEN_ID, TEST_TOKEN_ID_2]);
      expect(result).toEqual([
        {
          token_id: TEST_TOKEN_ID,
          name: 'test1.voi',
          address: 'TESTADDRESS1',
          metadata: { url: 'https://example1.com' }
        },
        {
          token_id: TEST_TOKEN_ID_2,
          name: 'test2.voi',
          address: 'TESTADDRESS2',
          metadata: { url: 'https://example2.com' }
        }
      ]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/token/${TEST_TOKEN_ID},${TEST_TOKEN_ID_2}?avatar=thumb`,
        expect.any(Object)
      );
    });

    it('should return empty array for failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await client.getTokenInfo([TEST_TOKEN_ID, TEST_TOKEN_ID_2]);
      expect(result).toEqual([]);
    });

    it('should filter out results with missing token_id', async () => {
      const mockResponse = {
        results: [
          {
            token_id: TEST_TOKEN_ID,
            name: 'test1.voi',
            address: 'TESTADDRESS1',
            metadata: {},
            cached: false
          },
          {
            name: 'test2.voi',
            address: 'TESTADDRESS2',
            metadata: {},
            cached: false
          }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getTokenInfo([TEST_TOKEN_ID, TEST_TOKEN_ID_2]);
      expect(result).toHaveLength(1);
      expect(result[0].token_id).toBe(TEST_TOKEN_ID);
    });
  });
}); 