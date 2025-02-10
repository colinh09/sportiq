import { UserProfile, ApiError } from './types';
import api from './axios';

export const usersApi = {
  getLearningStreak: async (): Promise<number> => {
    try {
      const response = await api.get<number>('/streak');
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },
  
  fetchUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>(`/user/fetch?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  register: async (userId: string, username: string): Promise<void> => {
    try {
      await api.post('/user/register', {
        userId,
        username
      });
    } catch (error) {
      throw error as ApiError;
    }
  }
};