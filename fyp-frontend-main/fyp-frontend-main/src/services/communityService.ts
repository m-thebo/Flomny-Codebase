import axios from 'axios';
import nookies from 'nookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface CommunityItem {
  id: string;
  name?: string;
  displayName?: string;
  description: string;
  createdBy: string;
  public: boolean;
  workflowURL?: string;
  uniqueName?: string;
  additionalInfo?: {
    isFileBased?: boolean;
    fileStatus: string;
    publicBaseURL?: string;
    documentationURL: string;
    isLocallyStored?: boolean;
  };
  createdAt: {
    seconds: number;
    nanos: number;
  };
  updatedAt: {
    seconds: number;
    nanos: number;
  };
}

export interface PaginatedResponse {
  workflows?: CommunityItem[];
  integrations?: CommunityItem[];
  total: number;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const cookies = nookies.get(null);
    const token = cookies.accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      console.error('Authentication error:', error);
      // You might want to redirect to login page or show an error message
    }
    return Promise.reject(error);
  }
);

export const communityService = {
  async getWorkflows(offset: number, limit: number, search?: string): Promise<PaginatedResponse> {
    try {
      const response = await api.get('/workflow/community', {
        params: { offset, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  async getIntegrations(offset: number, limit: number, search?: string): Promise<PaginatedResponse> {
    try {
      const response = await api.get('/integration/community', {
        params: { offset, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }
}; 