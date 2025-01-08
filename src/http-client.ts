import { API_BASE_URL } from './config.js';

export interface EnvoiHttpClient {
  getNameFromAddress: (address: string) => Promise<string>;
  getAddressFromName: (name: string) => Promise<string>;
  search: (query: string) => Promise<Array<{
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
    getNameFromAddress: async (address: string): Promise<string> => {
      try {
        const url = `${API_BASE_URL}/api/name/${address}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return '';
        }
        const data = await response.json() as EnvoiResponse;
        return data.results?.[0]?.name || '';
      } catch (error) {
        console.error('Error fetching name from address:', error);
        return '';
      }
    },

    getAddressFromName: async (name: string): Promise<string> => {
      try {
        const url = `${API_BASE_URL}/api/address/${name}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          return '';
        }
        const data = await response.json() as EnvoiResponse;
        return data.results?.[0]?.address || '';
      } catch (error) {
        console.error('Error fetching address from name:', error);
        return '';
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
    }
  };
} 