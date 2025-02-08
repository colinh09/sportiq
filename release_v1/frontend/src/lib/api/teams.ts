import { Team, TeamDetails, ApiError } from './types';
import api from './axios';

export const teamsApi = {
    getAllTeams: async (): Promise<Team[]> => {
      try {
        const response = await api.get<Team[]>('/teams');
        return response.data;
      } catch (error) {
        throw error as ApiError;
      }
    },

  getTeamDetails: async (teamId: string): Promise<TeamDetails> => {
    try {
      const response = await api.get<TeamDetails>(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
};