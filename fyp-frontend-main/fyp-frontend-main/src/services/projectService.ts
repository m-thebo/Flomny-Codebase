// Project service for managing projects and saving workflows
import axios from 'axios';
import nookies from 'nookies';

export interface Project {
  id: string;
  title: string;
  description: string;
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

export interface CreateProjectRequest {
  title: string;
  description: string;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  updatedAt: any;
}

export interface ProjectWithWorkflows extends Project {
  workflows: Workflow[];
}

export interface UpdateProjectRequest {
  id: string;
  title: string;
  description: string;
}

export interface UpdateProjectResponse {
  project: Project;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/project` : 'http://localhost:8000/project');

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

export const projectService = {
  // Get user projects
  async getUserProjects(): Promise<Project[]> {
    const res = await api.get('/user');
    return res.data.projects;
  },

  // Get project by ID
  async getProjectById(id: string): Promise<ProjectWithWorkflows> {
    try {
      const res = await api.get(`/${id}`);
      // Combine project data with workflows
      return {
        ...res.data.project,
        workflows: res.data.workflows || []
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create a new project
  async createProject(request: CreateProjectRequest): Promise<Project> {
    const res = await api.post<CreateProjectResponse>('/', request);
    return res.data.project;
  },

  async deleteProject(id: string): Promise<void> {
    try {
      // First get the project to get all associated workflows
      const project = await this.getProjectById(id);

      // Delete all workflows associated with this project
      if (project.workflows && project.workflows.length > 0) {
        const workflowService = (await import('./workflowService')).workflowService;
        await Promise.all(
          project.workflows.map(workflow => workflowService.deleteWorkflow(workflow.id))
        );
      }

      // Finally delete the project
      await api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  async updateProject(request: UpdateProjectRequest): Promise<Project> {
    try {
      const res = await api.patch<UpdateProjectResponse>(`/${request.id}`, {
        title: request.title,
        description: request.description
      });
      return res.data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }
};

