import { ApiError, ModuleTopic, ModuleDetails, ModulesResponse } from './types';
import api from './axios';

interface CreateModuleInput {
  title: string;
  topic: ModuleTopic;
  concept: string;
  difficulty: 0 | 1 | 2;
  userId: string;
}

interface GetUserModulesParams {
  userId: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'difficulty' | 'status';
  sort_order?: 'asc' | 'desc';
}

interface ToggleModuleStatusInput {
  userId: string;
  moduleId: number;
  status: boolean;
}

export const modulesApi = {
  createModule: async (moduleData: CreateModuleInput) => {
    try {
      const response = await api.post('/modules', moduleData);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  getModule: async (moduleId: number, userId?: string) => {
    try {
      const response = await api.get('/modules', {
        params: {
          moduleId,
          userId
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  getUserModules: async ({
    userId,
    page = 1,
    limit = 10,
    sort_by = 'created_at',
    sort_order = 'desc'
  }: GetUserModulesParams) => {
    try {
      const response = await api.get('/modules/getusermodules', {
        params: {
          userId,
          page,
          limit,
          sort_by,
          sort_order
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  toggleModuleStatus: async ({ userId, moduleId, status }: ToggleModuleStatusInput) => {
    try {
      const response = await api.patch('/modules/status', {
        userId,
        moduleId,
        status
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  deleteUserModule: async (userId: string, moduleId: number) => {
    try {
      const response = await api.delete('/modules/deleteusermodule', {
        params: {
          userId,
          moduleId
        }
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  addUserModule: async (userId: string, moduleId: number) => {
    try {
      const response = await api.post('/modules/addusermodule', {
        userId,
        moduleId
      });
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }
};