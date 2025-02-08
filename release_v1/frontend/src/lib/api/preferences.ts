import { ApiError } from './types';
import api from './axios';

export const preferencesApi = {
  // Team preferences
  getTeamPreferences: async (userId: string) => {
    try {
      const response = await api.get(`/preferences/teams?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  addTeamPreference: async (userId: string, teamId: string) => {
    try {
      const response = await api.post('/preferences/teams', { userId, teamId });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  removeTeamPreference: async (userId: string, teamId: string) => {
    try {
      const response = await api.delete('/preferences/teams', { data: { userId, teamId } });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  // Player preferences
  getPlayerPreferences: async (userId: string) => {
    try {
      const response = await api.get(`/preferences/players?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  addPlayerPreference: async (userId: string, playerId: number) => {
    try {
      const response = await api.post('/preferences/players', { userId, playerId });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  removePlayerPreference: async (userId: string, playerId: number) => {
    try {
      const response = await api.delete('/preferences/players', { data: { userId, playerId } });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  // Module preferences
  getModulePreferences: async (userId: string) => {
    try {
      const response = await api.get(`/preferences/modules?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  addModulePreference: async (userId: string, moduleId: number) => {
    try {
      const response = await api.post('/preferences/modules', { userId, moduleId });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  removeModulePreference: async (userId: string, moduleId: number) => {
    try {
      const response = await api.delete('/preferences/modules', { data: { userId, moduleId } });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
};
