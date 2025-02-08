import { Team, TeamDetails, SearchResult, ApiError } from './types';
import api from './axios';

export const searchApi = {
    search: async (keywords: string): Promise<SearchResult[]> => {
      try {
        const response = await api.get<SearchResult[]>('/search', {
          params: { keywords }
        });
        return response.data; 
      } catch (error) {
        throw error as ApiError;
      }
    }
};