// Project service for managing projects and saving workflows
import axios from 'axios';
import nookies from 'nookies';

export interface Timestamp {
  seconds: number;
  nanos: number;
}
export interface Workflow {
  id: string;
  name: string;
  description: string;
  public: boolean;
  workflowURL: string;
  projectId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}

export interface DeleteWorkflowRequest {
  id: string;
}

export interface DeleteWorkflowResponse {
  success: boolean;
}

export interface UpdateWorkflowRequest {
  id: string;
  name: string;
  description: string;
  projectId?: string;
}

export interface UpdateWorkflowResponse {
  workflow: Workflow;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflow` : 'http://localhost:8000/workflow');

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

export const workflowService = {
  // Get user workflows
  async getUserWorkflows(): Promise<Workflow[]> {
    try {
      const res = await api.get('/user');
      const workflows = res.data.workflows || [];
      // Filter out workflows that have been soft deleted
      return workflows.filter((workflow: Workflow) => {
        return !workflow.deletedAt || workflow.deletedAt.seconds === 0;
      });
    } catch (error) {
      console.error('Error fetching user workflows:', error);
      return [];
    }
  },

  // Get workflow by ID
  async getWorkflowById(id: string): Promise<Workflow | null> {
    try {
      const res = await api.get(`/${id}`);
      const workflow = res.data.response.workflow;
      // Return null if workflow is soft deleted
      if (!workflow || (workflow.deletedAt && workflow.deletedAt.seconds !== 0)) {
        return null;
      }
      return workflow;
    } catch (error) {
      console.error(`Error fetching workflow with ID ${id}:`, error);
      return null;
    }
  },

  // upload integration documentation file
  async uploadGeneratedWorkflowFile(file: File): Promise<{ file_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/docs/flomny-workflows` : 'http://localhost:8000/docs/flomny-workflows'),
      formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    );
    return response.data;
  },

  // Get all workflows for a project
  async getProjectWorkflows(projectId: string): Promise<Workflow[]> {
    const res = await api.get(`/project/${projectId}`);
    return res.data.workflows;
  },

  // Create workflow
  async createWorkflow(data: {
    name: string;
    description: string;
    public: boolean;
    workflowUrl: string;
    projectId?: string;
  }): Promise<Workflow> {
    const payload = {
      name: data.name,
      description: data.description,
      public: data.public,
      workflowUrl: data.workflowUrl,
      projectId: data.projectId,
    };
    const res = await api.post("/", payload);
    return res.data.workflow;
  },

  // Delete workflow
  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      // First check if the workflow is already deleted
      const workflow = await this.getWorkflowById(id);
      if (!workflow) {
        return true; // Already deleted or doesn't exist
      }

      // Delete the workflow and ensure it's removed from recents
      const res = await api.delete<DeleteWorkflowResponse>(`/${id}`, {
        data: {
          id,
          removeFromRecents: true // Add flag to ensure removal from recents
        }
      });
      return res.data.success;
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error);
      throw error;
    }
  },

  async updateWorkflow(request: UpdateWorkflowRequest): Promise<Workflow> {
    try {
      const res = await api.patch<UpdateWorkflowResponse>(`/${request.id}`, {
        name: request.name,
        description: request.description,
        projectId: request.projectId
      });
      return res.data.workflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }
};
