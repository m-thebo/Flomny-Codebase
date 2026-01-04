import axios from 'axios';
import nookies from 'nookies';

export interface McpIntegration {
    id: string;
    name: string;
    displayName: string;
    systemPrompt: string;
    description: string;
    type: string;
    command: string;
    args: string[];
    env: string[];
    hostingUrl: string;
    usage: string;
    createdBy: string;
    createdAt: {
        seconds: number;
        nanos: number;
    };
    updatedAt: {
        seconds: number;
        nanos: number;
    };
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mcp-integration` : 'http://localhost:8000/mcp-integration');

const api = axios.create({
    baseURL: API_BASE_URL,
});

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

export const mcpIntegrationService = {
    async getIntegrations(offset = 0, limit = 10): Promise<{ mcpServers: McpIntegration[]; total: number }> {
        const res = await api.get('/', { params: { offset, limit } });
        return res.data;
    },

    async searchIntegrations(search: string, offset = 0, limit = 10): Promise<{ mcpServers: McpIntegration[]; total: number }> {
        const res = await api.get('/search', { params: { search, offset, limit } });
        return res.data;
    },
}; 