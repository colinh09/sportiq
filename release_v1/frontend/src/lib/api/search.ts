import { Team, SearchParams, SearchResult, ApiError } from './types';
import api from './axios';

export const searchApi = {
  search: async ({ keywords, type = 'players' }: SearchParams): Promise<SearchResult[]> => {
    try {
      const response = await api.get<SearchResult[]>('/search', {
        params: { keywords, type }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
};