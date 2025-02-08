import { Team, TeamDetails, ApiError } from './types';
import api from './axios';

export const usersApi = {
    getLearningStreak: async (): Promise<number> => {
      try {
        const response = await api.get<number>('/streak');
        return response.data;
      } catch (error) {
        throw error as ApiError;
      }
    }
  };

  