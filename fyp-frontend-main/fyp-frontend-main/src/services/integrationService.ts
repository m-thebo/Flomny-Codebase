import axios from 'axios';
import nookies from 'nookies';

export interface AdditionalInfo {
    isFileBased: boolean;
    fileStatus: string;
    failedReason?: string;
    publicBaseURL: string;
    documentationURL: string;
    isLocallyStored: boolean;
}

export interface Integration {
    id: string;
    displayName: string;
    public: boolean;
    uniqueName: string;
    description: string;
    createdBy: string;
    additionalInfo: AdditionalInfo;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/integration` : 'http://localhost:8000/integration');
const PLACEHOLDER_DOC_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_DOC_URL || "http://localhost:8000/docs/flomny-integrations/placeholder-openapi.yaml";

// Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
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

export const integrationService = {
    // upload integration documentation file
    async uploadDocumentationFile(file: File): Promise<{ file_url: string; message: string }> {
        const formData = new FormData();
        formData.append('file', file);

        // Make the POST request to the /docs/flomny-integrations endpoint
        // Note: We use a separate URL here, not the one defined in API_BASE_URL
        const response = await api.post(
            (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/docs/flomny-integrations` : 'http://localhost:8000/docs/flomny-integrations'),
            formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
        );
        return response.data; // Expecting { file_url: string; message: string }
    },

    // Get user integrations
    async getIntegrations(): Promise<Integration[]> {
        const res = await api.get('/user');
        return res.data.integrations;
    },

    // Get integration by ID
    async getIntegrationById(id: string): Promise<Integration | null> {
        try {
            const res = await api.get(`/${id}`);
            return res.data.integration;
        } catch (error) {
            console.error(`Error fetching integration with ID ${id}:`, error);
            return null;
        }
    },

    // Search integrations
    async searchIntegrations(query: string): Promise<Integration[]> {
        const res = await api.get('/search', { params: { query } });
        return res.data.integrations;
    },

    // Create integration
    async createIntegration(data: {
        displayName: string;
        uniqueName: string;
        description: string;
        base_url: string;
        documentation_url?: string;
        public: boolean;
        is_locally_stored: boolean;
    }): Promise<Integration> {
        // Use a placeholder documentation URL if not provided
        const payload = {
            displayName: data.displayName,
            uniqueName: data.uniqueName,
            description: data.description,
            base_url: data.base_url,
            documentation_url: data.documentation_url || PLACEHOLDER_DOC_URL,
            public: data.public,
            is_locally_stored: data.is_locally_stored,
        };
        const res = await api.post("/", payload);
        return res.data.integration;
    },

    // Update integration
    async updateIntegration(id: string, data: {
        displayName: string;
        uniqueName: string;
        description: string;
        base_url: string;
        documentation_url?: string;
        public: boolean;
        is_locally_stored: boolean;
    }): Promise<Integration> {
        // Use a placeholder documentation URL if not provided
        const payload = {
            displayName: data.displayName,
            uniqueName: data.uniqueName,
            description: data.description,
            base_url: data.base_url,
            documentation_url: data.documentation_url || PLACEHOLDER_DOC_URL,
            public: data.public,
            is_locally_stored: String(data.is_locally_stored),
        };
        const res = await api.patch(`/${id}`, payload);
        return res.data.integration;
    },

    // Delete integration
    async deleteIntegration(id: string): Promise<void> {
        await api.delete(`/${id}`);
    }
}; 