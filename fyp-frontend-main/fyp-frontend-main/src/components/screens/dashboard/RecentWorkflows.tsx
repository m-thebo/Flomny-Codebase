"use client"

import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "../ui/skeleton"
import { Calendar } from "lucide-react"
import { workflowService, Workflow } from "@/services/workflowService"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface RecentWorkflowsProps {
  isLoading: boolean
  userId?: string
  searchQuery?: string
}

export default function RecentWorkflows({ isLoading, userId, searchQuery = "" }: RecentWorkflowsProps) {
  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([])
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchWorkflows = useCallback(async () => {
    if (!userId) return

    try {
      setLoadingWorkflows(true)
      const workflows = await workflowService.getUserWorkflows()
      setRecentWorkflows(workflows)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast({
        title: "Error",
        description: "Failed to fetch workflows. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingWorkflows(false)
    }
  }, [userId, toast])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  // Filter workflows based on search query
  const filteredWorkflows = recentWorkflows.filter(workflow => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(searchLower) ||
      workflow.description.toLowerCase().includes(searchLower)
    );
  });

  // Add event listener for workflow deletion
  useEffect(() => {
    const handleWorkflowDeleted = () => {
      fetchWorkflows();
      toast({
        title: "Workflow deleted",
        description: "The workflow has been successfully deleted.",
        variant: "success",
      });
    };

    const handleWorkflowUpdated = () => {
      fetchWorkflows();
      toast({
        title: "Workflow updated",
        description: "The workflow has been successfully updated.",
        variant: "success",
      });
    };

    window.addEventListener('workflowDeleted', handleWorkflowDeleted);
    window.addEventListener('workflowUpdated', handleWorkflowUpdated);
    return () => {
      window.removeEventListener('workflowDeleted', handleWorkflowDeleted);
      window.removeEventListener('workflowUpdated', handleWorkflowUpdated);
    };
  }, [fetchWorkflows, toast]);

  const showSkeletons = isLoading || loadingWorkflows

  const formatDate = (timestamp: { seconds: number; nanos: number }) => {
    const date = new Date(timestamp.seconds * 1000)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {showSkeletons
        ? Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        : filteredWorkflows.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No workflows found</p>
            <Link
              href="/workflow"
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Create your first workflow
            </Link>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <Link
              key={workflow.id}
              href={`/workflow/${workflow.id}`}
              className="block"
            >
              <div
                className={`bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200 group ${
                  searchQuery && (
                    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ) ? 'ring-2 ring-[#001e80] ring-opacity-50' : ''
                }`}
              >
                <h3 className="font-medium text-base text-gray-900 group-hover:text-[#001e80] transition-colors">
                  {workflow.name}
                </h3>
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Last edited {formatDate(workflow.updatedAt)}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {workflow.description}
                </p>
              </div>
            </Link>
          ))
        )}
    </div>
  )
}

