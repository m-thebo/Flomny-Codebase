"use client"

import { useState, useEffect } from "react"
import { Folder, MoreVertical, Calendar, Plus } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { projectService, Project } from "@/services/projectService"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ProjectListProps {
  isLoading: boolean
  userId?: string
  searchQuery?: string
}

export default function ProjectList({ isLoading, userId, searchQuery = "" }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [newProject, setNewProject] = useState({ title: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const { toast } = useToast()

  const fetchProjects = async () => {
    if (!userId) return;

    try {
      setLoadingProjects(true);
      const fetchedProjects = await projectService.getUserProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      setCreateError("Project title is required");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const project = await projectService.createProject({
        title: newProject.title,
        description: newProject.description
      });
      setProjects(prev => [...prev, project]);
      setIsCreateProjectOpen(false);
      setNewProject({ title: "", description: "" });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
        variant: "success",
      });
    } catch (error) {
      setCreateError("Failed to create project. Please try again.");
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Add event listener for project creation
  useEffect(() => {
    const handleProjectCreated = () => {
      fetchProjects();
    };

    window.addEventListener('projectCreated', handleProjectCreated);
    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
    };
  }, [fetchProjects]);

  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'Date not available'

      // Handle timestamp object with seconds and nanos
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }

      // Handle ISO string
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }

      // Handle regular date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }

      return 'Invalid date'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Date not available'
    }
  }

  const showSkeletons = isLoading || loadingProjects

  return (
    <>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {showSkeletons
        ? Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
          : (
            <>
              {/* New Project Box */}
              <div
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-white rounded-xl p-5 border border-dashed border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#001e80] hover:bg-[#E9EEFF] group h-[180px] flex flex-col"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#E9EEFF] p-2 rounded-lg">
                      <Plus className="h-8 w-8 text-[#001e80]" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-base text-gray-900 group-hover:text-[#001e80] transition-colors">
                    New Project
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a new project to organize your workflows
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-4"></div> {/* Spacer to align with other boxes */}
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No projects found</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  project && (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <div className={`bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200 group h-[180px] flex flex-col ${
                        searchQuery && (
                          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
                        ) ? 'ring-2 ring-[#001e80] ring-opacity-50' : ''
                      }`}>
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#E9EEFF] p-2 rounded-lg">
                              <Folder className="h-8 w-8 text-[#001e80]" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-base text-gray-900 group-hover:text-[#001e80] transition-colors line-clamp-1">
                            {project.title || 'Untitled Project'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Last edited {formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                ))
              )}
            </>
          )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Project Title
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
            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
        )}
    </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateProjectOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="bg-[#001e80] text-white"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

