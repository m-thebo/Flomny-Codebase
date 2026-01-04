'use client';
import React, { useState, useEffect } from 'react';
import { WorkflowConsole } from '../../components/WorkflowConsole';
import { testWebSocketConnection } from '../../utils/websocketTester';
import { ArrowLeft, Search, Check, X, ChevronRight, Folder, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/assets/logosaas.png';
import { Integration, integrationService } from '@/services/integrationService';
import { Project, projectService } from '@/services/projectService';
import { workflowService } from '@/services/workflowService';
import { Button } from '@/components/screens/ui/button';
import { Input } from '@/components/screens/ui/input';
import { Badge } from '@/components/screens/ui/badge';
import { ScrollArea } from '@/components/screens/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/screens/ui/dialog';
import { Switch } from '@/components/screens/ui/switch';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/screens/ui/textarea';

export default function WorkflowPage() {
  const router = useRouter();
  const [serverUrl, setServerUrl] = useState(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'integrations' | 'workflow' | 'save'>('integrations');

  // Integration management states
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegrations, setSelectedIntegrations] = useState<Integration[]>([]);
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Project management states
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [workflowCode, setWorkflowCode] = useState<string>('');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [skipProject, setSkipProject] = useState(false);
  const [workflowUrl, setWorkflowUrl] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [taskDescriptions, setTaskDescriptions] = useState<string[]>([]);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);

  // Auto-test connection when component mounts
  useEffect(() => {
    const testConnection = async () => {
      setIsTesting(true);
      try {
        const result = await testWebSocketConnection(serverUrl);
        setTestResult(result);
      } catch (error) {
        setTestResult({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } finally {
        setIsTesting(false);
      }
    };

    testConnection();
  }, [serverUrl]);

  // Load integrations
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const data = await integrationService.getIntegrations();
        setIntegrations(data);
      } catch (error) {
        console.error("Error loading integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const projectData = await projectService.getUserProjects();
        setProjects(projectData);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (currentStep === 'save') {
      loadProjects();
    }
  }, [currentStep]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    try {
      if (query.trim()) {
        const results = await integrationService.searchIntegrations(query);
        setIntegrations(results);
      } else {
        const allIntegrations = await integrationService.getIntegrations();
        setIntegrations(allIntegrations);
      }
    } catch (error) {
      console.error("Error searching integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL input change - kept for functionality
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setServerUrl(e.target.value);
    setTestResult(null);
  };

  // Handle integration selection
  const toggleIntegration = (integration: Integration) => {
    const isSelected = selectedIntegrations.some(i => i.id === integration.id);
    let newSelectedIntegrations: Integration[];

    if (isSelected) {
      newSelectedIntegrations = selectedIntegrations.filter(i => i.id !== integration.id);
    } else {
      newSelectedIntegrations = [...selectedIntegrations, integration];
    }

    setSelectedIntegrations(newSelectedIntegrations);
    setSelectedIntegrationIds(newSelectedIntegrations.map(i => i.id));
  };

  // Proceed to workflow after selecting integrations
  const proceedToWorkflow = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (selectedIntegrations.length > 0) {
      setCurrentStep('workflow');
    }
  };

  // Back to integration selection
  const backToIntegrations = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setCurrentStep('integrations');
  };

  // Set workflow code and show save dialog
  const handleSaveWorkflow = (code: string, tasksDescription?: string) => {
    setWorkflowCode(code);

    // Set workflow description from tasks if available
    if (tasksDescription) {
      setWorkflowDescription(tasksDescription);
    }

    setCurrentStep('save');
  };

  // Handle project selection
  const handleSelectProject = (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (skipProject) {
      setSkipProject(false);
    }
    // If the clicked project is already selected, deselect it
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
    }
  };

  // Toggle skip project
  const handleSkipProjectToggle = (checked?: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setSkipProject(checked !== undefined ? checked : !skipProject);
    if (!skipProject) {
      setSelectedProject(null);
    }
  };

  // Upload workflow file
  const uploadWorkflowFile = async (code: string): Promise<string> => {
    // Create a file from the code
    const blob = new Blob([code], { type: 'text/plain' });
    const file = new File([blob], 'main.py', { type: 'text/plain' });

    try {
      const result = await workflowService.uploadGeneratedWorkflowFile(file);
      return result.file_url;
    } catch (error) {
      console.error('Error uploading workflow file:', error);
      throw new Error('Failed to upload workflow file');
    }
  };

  // Save workflow to project
  const saveWorkflowToProject = async () => {
    if (!workflowCode || !workflowName || !workflowDescription) {
      setSaveError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // First upload the workflow file
      setUploadingFile(true);
      const fileUrl = await uploadWorkflowFile(workflowCode);
      setUploadingFile(false);
      setWorkflowUrl(fileUrl);

      // Then create the workflow
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        public: isPublic,
        workflowUrl: fileUrl,
        projectId: skipProject ? undefined : selectedProject?.id
      };

      await workflowService.createWorkflow(workflowData);

      // Redirect to project page or dashboard after successful save
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving workflow:", error);
      setSaveError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle project creation
  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      setCreateProjectError("Project title is required");
      return;
    }

    setIsCreatingProject(true);
    setCreateProjectError(null);

    try {
      const project = await projectService.createProject({
        title: newProject.title,
        description: newProject.description
      });

      // Add the new project to the list and select it
      setProjects(prev => [...prev, project]);
      setSelectedProject(project);
      setSkipProject(false);
      setIsCreateProjectOpen(false);
      setNewProject({ title: "", description: "" });

      // Force a refresh of the projects list
      const updatedProjects = await projectService.getUserProjects();
      setProjects(updatedProjects);
    } catch (error) {
      setCreateProjectError("Failed to create project. Please try again.");
      console.error("Error creating project:", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#D2DCFF]">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20 transition-all duration-300">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentStep === 'workflow') {
                  setCurrentStep('integrations');
                } else if (currentStep === 'save') {
                  setCurrentStep('workflow');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center gap-4 text-[#001e80] hover:text-[#001a70] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <Image
                src={Logo || "/placeholder.svg"}
                alt="Saas Logo"
                height={36}
                width={36}
                className="cursor-pointer"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-[#E9EEFF] px-3 py-1 text-xs font-medium text-[#001e80] mb-3">
            {currentStep === 'integrations'
              ? 'Step 1: Select Integrations'
              : currentStep === 'workflow'
                ? 'Step 2: Create Workflow'
                : 'Step 3: Save Workflow'}
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text">
            {currentStep === 'integrations'
              ? 'Select Your Integrations'
              : currentStep === 'workflow'
                ? 'Create Your Workflow'
                : 'Save Your Workflow'}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {currentStep === 'integrations'
              ? 'Choose the integrations you want to use in your workflow'
              : currentStep === 'workflow'
                ? 'Create AI-powered workflows to connect your apps and automate repetitive tasks effortlessly'
                : 'Select a project to save your workflow to'
            }
          </p>
        </div>

        {/* Integration Selection Step */}
        {currentStep === 'integrations' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Section - Selected Integrations */}
                <div className="md:col-span-5 p-6 bg-[#F8F9FE] border-r border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Your Selection</h2>

                  {selectedIntegrations.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-[#E9EEFF] flex items-center justify-center mb-4">
                        <ChevronRight className="h-6 w-6 text-[#001e80]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No integrations selected</h3>
                      <p className="text-gray-500 mb-4">Select integrations from the list to continue</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedIntegrations.map(integration => (
                          <Badge
                            key={integration.id}
                            variant="secondary"
                            className="px-3 py-2 flex items-center gap-1 text-sm"
                          >
                            {integration.displayName}
                            <button
                              onClick={(e) => toggleIntegration(integration)}
                              className="ml-1 hover:text-gray-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={proceedToWorkflow}
                        className="w-full py-2 bg-[#001e80] hover:bg-[#001a70] text-white flex items-center justify-center gap-2"
                      >
                        Continue to Workflow <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Right Section - All Integrations */}
                <div className="md:col-span-7 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Available Integrations</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search integrations..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-6">
                      {/* User's Integrations Section */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Your Integrations</h3>
                        <div className="space-y-2">
                          {isLoading ? (
                            <div className="text-center py-4 text-gray-500">Loading...</div>
                          ) : integrations.filter(i => !i.public).length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No personal integrations found</div>
                          ) : (
                            integrations.filter(i => !i.public).map(integration => {
                              const isSelected = selectedIntegrations.some(i => i.id === integration.id);
                              return (
                                <button
                                  key={integration.id}
                                  onClick={(e) => toggleIntegration(integration)}
                                  className={`w-full p-4 rounded-lg border text-left transition-colors ${isSelected
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{integration.displayName}</h4>
                                      <p className="text-sm text-gray-500">{integration.uniqueName}</p>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Public Integrations Section */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Public Integrations</h3>
                        <div className="space-y-2">
                          {isLoading ? (
                            <div className="text-center py-4 text-gray-500">Loading...</div>
                          ) : integrations.filter(i => i.public).length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No public integrations found</div>
                          ) : (
                            integrations.filter(i => i.public).map(integration => {
                              const isSelected = selectedIntegrations.some(i => i.id === integration.id);
                              return (
                                <button
                                  key={integration.id}
                                  onClick={(e) => toggleIntegration(integration)}
                                  className={`w-full p-4 rounded-lg border text-left transition-colors ${isSelected
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{integration.displayName}</h4>
                                      <p className="text-sm text-gray-500">{integration.uniqueName}</p>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Console Step */}
        {currentStep === 'workflow' && (
          <div className="relative">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <h2 className="text-sm font-medium text-gray-500 mr-2">Using integrations:</h2>
                  {selectedIntegrations.map(integration => (
                    <Badge
                      key={integration.id}
                      className="px-2 py-1 bg-blue-50 border hover:bg-blue-200 border-blue-200 text-xs text-black"
                    >
                      {integration.displayName}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 text-blue-600"
                  onClick={backToIntegrations}
                >
                  Change Integrations
                </Button>
              </div>
            </div>
            <WorkflowConsole
              serverUrl={serverUrl}
              selectedIntegrationIds={selectedIntegrationIds}
              onSaveWorkflow={handleSaveWorkflow}
            />
          </div>
        )}

        {/* Save Workflow Step */}
        {currentStep === 'save' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Save Workflow</h2>

                {workflowCode ? (
                  <>
                    {/* Workflow form */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Workflow Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter workflow name..."
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          placeholder="Enter workflow description..."
                          value={workflowDescription}
                          onChange={(e) => setWorkflowDescription(e.target.value)}
                          className="w-full min-h-[120px]"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            id="public-workflow"
                          />
                          <label htmlFor="public-workflow" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Make workflow public
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Project Selection
                          </label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={skipProject}
                              onCheckedChange={handleSkipProjectToggle}
                              id="skip-project"
                            />
                            <label htmlFor="skip-project" className="text-sm text-gray-500 cursor-pointer">
                              Skip project selection
                            </label>
                          </div>
                        </div>

                        {!skipProject ? (
                          projectsLoading ? (
                            <div className="text-center py-8 text-gray-500">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                              Loading projects...
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects && projects.length > 0 ? (
                                  projects.map((project: Project) => (
                                    project && (
                                      <button
                                        key={project.id}
                                        onClick={(e) => handleSelectProject(project)}
                                        className={`p-4 rounded-lg border text-left transition-colors flex items-center justify-between ${selectedProject?.id === project.id
                                          ? "border-blue-200 bg-blue-50"
                                          : "border-gray-200 hover:bg-gray-50"
                                          }`}
                                        disabled={skipProject}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-[#E9EEFF] rounded-lg">
                                            <Folder className="h-5 w-5 text-[#001e80]" />
                                          </div>
                                          <span className="font-medium">{project.title}</span>
                                        </div>
                                        {selectedProject?.id === project.id && (
                                          <Check className="h-5 w-5 text-blue-600" />
                                        )}
                                      </button>
                                    )
                                  ))
                                ) : (
                                  <div className="col-span-2 text-center py-8 border border-dashed rounded-lg">
                                    <p className="text-gray-500 mb-2">No projects found</p>
                                    <p className="text-sm text-gray-400">Create a new project or skip project selection</p>
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={() => setIsCreateProjectOpen(true)}
                                variant="outline"
                                className="w-full border-dashed border-2 border-gray-200 hover:border-[#001e80] hover:bg-[#E9EEFF] transition-colors"
                              >
                                <Plus className="h-4 w-4 mr-2 text-[#001e80]" />
                                Create New Project
                              </Button>
                            </div>
                          )
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Your workflow will be saved without associating it with a project.
                              You can assign it to a project later from the dashboard.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {saveError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        {saveError}
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('workflow')}
                        className="px-4"
                      >
                        Back to Workflow
                      </Button>

                      <Button
                        onClick={saveWorkflowToProject}
                        disabled={(!selectedProject && !skipProject) || !workflowName || !workflowDescription || isSaving}
                        className="bg-[#001e80] hover:bg-[#001a70] text-white px-8"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {uploadingFile ? 'Uploading File...' : 'Saving Workflow...'}
                          </>
                        ) : (
                          "Save Workflow"
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-red-50 p-4 rounded-lg inline-flex mb-4">
                      <X className="h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Workflow Code Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Please go back to the workflow editor and generate some code before saving.
                    </p>
                    <Button
                      onClick={() => setCurrentStep('workflow')}
                      className="px-4"
                    >
                      Back to Workflow Editor
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Create Project Dialog */}
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your workflows
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Enter project title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  {createProjectError && (
                    <p className="text-sm text-red-600">{createProjectError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateProjectOpen(false)}
                    disabled={isCreatingProject}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={isCreatingProject}
                    className="bg-[#001e80] text-white"
                  >
                    {isCreatingProject ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-6 text-center mt-auto">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Image src={Logo || "/placeholder.svg"} height={30} width={30} alt="SaaS logo" className="relative" />
          </div>
          <p className="mt-4">&copy; 2024 Flomny.com, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}