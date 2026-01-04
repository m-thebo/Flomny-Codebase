"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { projectService, ProjectWithWorkflows } from "@/services/projectService"
import { Folder, Calendar, ArrowLeft, Plus, ChevronRight, MoreVertical, Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/assets/logosaas.png"
import { Button } from "@/components/screens/ui/button"
import { Skeleton } from "@/components/screens/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/screens/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/screens/ui/dropdown-menu"
import { Input } from "@/components/screens/ui/input"
import { Textarea } from "@/components/screens/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/screens/ui/toaster"

export default function ProjectDetails() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<ProjectWithWorkflows | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editedProject, setEditedProject] = useState({
    title: "",
    description: ""
  })

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available'
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString()
    }
    return new Date(timestamp).toLocaleDateString()
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectId = params.id as string
        const data = await projectService.getProjectById(projectId)
        setProject(data)
      } catch (err) {
        setError("Failed to load project details")
        console.error("Error fetching project:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

  const handleDeleteProject = async () => {
    if (!project) return;
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await projectService.deleteProject(project.id);
      setIsDeleteDialogOpen(false);
      router.push('/dashboard');
      setTimeout(() => {
        toast({
          title: "Project deleted",
          description: "The project and its workflows have been successfully deleted.",
          variant: "success",
        });
      }, 100);
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteError('Failed to delete project. Please try again.');
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    if (project) {
      setEditedProject({
        title: project.title,
        description: project.description
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateProject = async () => {
    if (!project) return;
    if (!editedProject.title.trim()) {
      setUpdateError("Project title is required");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedProject = await projectService.updateProject({
        id: project.id,
        title: editedProject.title,
        description: editedProject.description
      });
      
      setProject(prev => prev ? { ...prev, ...updatedProject } : null);
      setIsEditDialogOpen(false);
      router.refresh();
      setTimeout(() => {
        toast({
          title: "Project updated",
          description: "The project has been successfully updated.",
          variant: "success",
        });
      }, 100);
    } catch (error) {
      console.error('Error updating project:', error);
      setUpdateError('Failed to update project. Please try again.');
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20">
          <div className="container py-4">
            <Link href="/dashboard" className="flex items-center gap-4 text-[#001e80]">
              <ArrowLeft className="h-5 w-5" />
              <Image src={Logo} alt="Logo" height={36} width={36} />
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full mt-8" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#D2DCFF] py-8">
        <div className="container">
          <Link href="/dashboard" className="flex items-center gap-4 text-[#001e80] mb-8">
            <ArrowLeft className="h-5 w-5" />
            <Image src={Logo} alt="Logo" height={36} width={36} />
          </Link>
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Project not found"}</h1>
            <p className="text-gray-500 mb-6">The project you're looking for could not be found.</p>
            <Link
              href="/dashboard"
              className="text-[#001e80] hover:text-[#001e80]/80 font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20">
        <div className="container py-4">
          <Link href="/dashboard" className="flex items-center gap-4 text-[#001e80]">
            <ArrowLeft className="h-5 w-5" />
            <Image src={Logo} alt="Logo" height={36} width={36} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="bg-[#E9EEFF] p-3 rounded-xl">
                <Folder className="h-12 w-12 text-[#001e80]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {project?.title || 'Untitled Project'}
                </h1>
                <p className="text-gray-600 mb-4">
                  {project?.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Last edited {formatDate(project?.updatedAt)}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Workflows Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
              <p className="text-gray-500 mt-1">Manage your project workflows</p>
            </div>
            <Link href="/workflow">
              <Button className="bg-[#001e80] text-white hover:bg-[#001e80]/90 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Workflow
              </Button>
            </Link>
          </div>

          {!project?.workflows || project.workflows.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first workflow</p>
              <Link href="/workflow">
                <Button className="bg-[#001e80] text-white hover:bg-[#001e80]/90">
                  Create Workflow
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {project.workflows.map((workflow) => (
                <Link 
                  key={workflow.id} 
                  href={`/workflow/${workflow.id}?fromProject=${project.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200 group h-[180px] flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E9EEFF] p-2 rounded-lg">
                          <Folder className="h-8 w-8 text-[#001e80]" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base text-gray-900 group-hover:text-[#001e80] transition-colors line-clamp-1">
                        {workflow.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {workflow.description || 'No description'}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(workflow.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will delete all workflows within this project.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Project Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-title"
                value={editedProject.title}
                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            {updateError && (
              <p className="text-sm text-red-600">{updateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={isUpdating}
              className="bg-[#001e80] text-white"
            >
              {isUpdating ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Toaster component at the end */}
      <Toaster />
    </div>
  )
} 