import { API_BASE_URL } from './config.js';

export interface EnvoiHttpClient {
  getNameFromAddress: (address: string | string[]) => Promise<string[]>;
  getAddressFromName: (name: string | string[]) => Promise<string[]>;
  search: (query: string) => Promise<Array<{
    name: string;
    address: string;
    metadata?: unknown;
  }>>;
  getTokenInfo: (tokenId: string | string[], avatarFormat?: 'thumb' | 'full') => Promise<Array<{
    token_id: string;
    name: string;
    address: string;
    metadata?: unknown;
  }>>;
}

interface EnvoiResponse {
  results: Array<{
    name: string;
    address: string;
    metadata: unknown;
    cached: boolean;
    token_id?: string;
  }>;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function createHttpClient(): EnvoiHttpClient {
  return {
    getNameFromAddress: async (address: string | string[]): Promise<string[]> => {
      try {
        const addresses = Array.isArray(address) ? address : [address];
        const url = `${API_BASE_URL}/api/name/${addresses.join(',')}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return Array(addresses.length).fill('');
        }
        const data = await response.json() as EnvoiResponse;
        return data.results.map(result => result.name || '');
      } catch (error) {
        console.error('Error fetching name from address:', error);
        return Array(Array.isArray(address) ? address.length : 1).fill('');
      }
    },

    getAddressFromName: async (name: string | string[]): Promise<string[]> => {
      try {
        const names = Array.isArray(name) ? name : [name];
        const url = `${API_BASE_URL}/api/address/${names.join(',')}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return Array(names.length).fill('');
        }
        const data = await response.json() as EnvoiResponse;
        return data.results.map(result => result.address || '');
      } catch (error) {
        console.error('Error fetching address from name:', error);
        return Array(Array.isArray(name) ? name.length : 1).fill('');
      }
    },

    search: async (query: string): Promise<Array<{
      name: string;
      address: string;
      metadata?: unknown;
    }>> => {
      try {
        const url = `${API_BASE_URL}/api/search?pattern=${encodeURIComponent(query)}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return [];
        }
        const data = await response.json() as EnvoiResponse;
        return data.results.map(result => ({
          name: result.name,
          address: result.address,
          metadata: result.metadata
        }));
      } catch (error) {
        console.error('Error searching names:', error);
        return [];
      }
    },

    getTokenInfo: async (tokenId: string | string[], avatarFormat: 'thumb' | 'full' = 'thumb'): Promise<Array<{
      token_id: string;
      name: string;
      address: string;
      metadata?: unknown;
    }>> => {
      try {
        const tokenIds = Array.isArray(tokenId) ? tokenId : [tokenId];
        const url = `${API_BASE_URL}/api/token/${tokenIds.join(',')}?avatar=${avatarFormat}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return [];
        }
        const data = await response.json() as EnvoiResponse;
        return data.results
          .filter(result => result.token_id)
          .map(result => ({
            token_id: result.token_id!,
            name: result.name,
            address: result.address,
            metadata: result.metadata
          }));
      } catch (error) {
        console.error('Error fetching token info:', error);
        return [];
      }
    }
  };
} 