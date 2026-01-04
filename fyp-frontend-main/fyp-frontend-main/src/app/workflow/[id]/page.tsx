"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Globe, Lock, MoreVertical, Trash2, Pencil, Copy, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/assets/logosaas.png';
import { Workflow, workflowService } from '@/services/workflowService';
import { Skeleton } from '@/components/screens/ui/skeleton';
import { Button } from '@/components/screens/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/screens/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/screens/ui/dropdown-menu';
import nookies from 'nookies';
import { Input } from '@/components/screens/ui/input';
import { Textarea } from '@/components/screens/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/screens/ui/toaster';

// Regex to match <<<.INTEGRATION:PLACEHOLDER>>>
const PLACEHOLDER_REGEX = /<<<\.([A-Za-z0-9_ ]+):([A-Za-z0-9_ ]+)>>>/g;

function getHighlightedCode(code: string) {
    if (!code) return '';
    const lines = code.split('\n');
    return lines.map((line, idx) => {
        let result = [];
        let lastIndex = 0;
        let match;
        PLACEHOLDER_REGEX.lastIndex = 0;
        while ((match = PLACEHOLDER_REGEX.exec(line)) !== null) {
            const [ph] = match;
            if (match.index > lastIndex) {
                result.push(line.slice(lastIndex, match.index));
            }
            result.push(
                <span key={ph + idx} className="bg-yellow-100 text-yellow-800 rounded px-1 font-semibold transition-colors duration-200">
                    {ph}
                </span>
            );
            lastIndex = match.index + ph.length;
        }
        if (lastIndex < line.length) {
            result.push(line.slice(lastIndex));
        }
        return <div key={idx}>{result}</div>;
    });
}

export default function WorkflowDetails() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [workflowCode, setWorkflowCode] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [codeLoading, setCodeLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [editedWorkflow, setEditedWorkflow] = useState({
        name: "",
        description: ""
    });
    const [copied, setCopied] = useState(false);

    // Get the fromProject query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const fromProject = searchParams.get('fromProject');

    useEffect(() => {
        const fetchWorkflow = async () => {
            if (!params.id) return;

            try {
                const data = await workflowService.getWorkflowById(params.id as string);
                if (!data) {
                    setError('Workflow not found');
                    return;
                }
                setWorkflow(data);
                await fetchWorkflowCode(data.workflowURL);
            } catch (err) {
                setError('Failed to load workflow');
                console.error('Error fetching workflow:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkflow();
    }, [params.id]);

    const fetchWorkflowCode = async (url: string) => {
        try {
            const cookies = nookies.get(null);
            const token = cookies.accessToken;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workflow code');
            }

            const code = await response.text();
            setWorkflowCode(code);
        } catch (err) {
            console.error('Error fetching workflow code:', err);
            setError('Failed to load workflow code');
        } finally {
            setCodeLoading(false);
        }
    };

    const formatDate = (timestamp: { seconds: number; nanos: number }) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteWorkflow = async () => {
        if (!workflow) return;

        // Prevent multiple deletion attempts
        if (isDeleting) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const success = await workflowService.deleteWorkflow(workflow.id);
            if (success) {
                setIsDeleteDialogOpen(false);
                // Dispatch event for RecentWorkflows to update
                window.dispatchEvent(new Event('workflowDeleted'));
                // Navigate back to dashboard
                router.push('/dashboard');
                // Show toast after navigation
                setTimeout(() => {
                    toast({
                        title: "Workflow deleted",
                        description: "The workflow has been successfully deleted.",
                        variant: "success",
                    });
                }, 100);
            } else {
                setDeleteError('Failed to delete workflow');
                toast({
                    title: "Error",
                    description: "Failed to delete workflow. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('Error deleting workflow:', error.response?.data || error);
            setDeleteError('Failed to delete workflow. Please try again.');
            toast({
                title: "Error",
                description: "Failed to delete workflow. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = () => {
        if (workflow) {
            setEditedWorkflow({
                name: workflow.name,
                description: workflow.description
            });
            setIsEditDialogOpen(true);
        }
    };

    const handleUpdateWorkflow = async () => {
        if (!workflow) return;
        if (!editedWorkflow.name.trim()) {
            setUpdateError("Workflow name is required");
            return;
        }

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const updatedWorkflow = await workflowService.updateWorkflow({
                id: workflow.id,
                name: editedWorkflow.name,
                description: editedWorkflow.description,
                projectId: workflow.projectId
            });

            setWorkflow(updatedWorkflow);
            setIsEditDialogOpen(false);
            // Dispatch event for RecentWorkflows to update
            window.dispatchEvent(new Event('workflowUpdated'));
            // Quick refresh
            router.refresh();
            // Show toast after refresh
            setTimeout(() => {
                toast({
                    title: "Workflow updated",
                    description: "The workflow has been successfully updated.",
                    variant: "success",
                });
            }, 100);
        } catch (error) {
            console.error('Error updating workflow:', error);
            setUpdateError('Failed to update workflow. Please try again.');
            toast({
                title: "Error",
                description: "Failed to update workflow. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-[#D2DCFF] py-8">
                <div className="container">
                    <Link href="/dashboard" className="flex items-center gap-4 text-[#001e80] mb-8">
                        <ArrowLeft className="h-5 w-5" />
                        <Image src={Logo} alt="Logo" height={36} width={36} />
                    </Link>
                    <div className="bg-white rounded-xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
                        <p className="text-gray-500 mb-6">The workflow you're looking for could not be found.</p>
                        <Link
                            href="/dashboard"
                            className="text-[#001e80] hover:text-[#001e80]/80 font-medium"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20">
                <div className="container py-4">
                    <Link
                        href={fromProject ? `/projects/${fromProject}` : '/dashboard'}
                        className="flex items-center gap-4 text-[#001e80]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <Image src={Logo} alt="Logo" height={36} width={36} />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container py-8">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-32 w-full mt-8" />
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
                        <p className="text-gray-500 mb-6">The workflow you're looking for could not be found.</p>
                        <Link
                            href="/dashboard"
                            className="text-[#001e80] hover:text-[#001e80]/80 font-medium"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                ) : workflow ? (
                    <div className="max-w-4xl">
                        <div className="mb-8 pl-4">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {workflow.name}
                                </h1>
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
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created {formatDate(workflow.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {workflow.public ? (
                                        <>
                                            <Globe className="h-4 w-4" />
                                            <span>Public</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4" />
                                            <span>Private</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-4">Description</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">{workflow.description}</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                                    Workflow Code
                                    <div className="flex gap-2 items-center">
                                        {!codeLoading && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(workflowCode);
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 1200);
                                                }}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors duration-200 ${copied ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                title="Copy code"
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        )}
                                        {!codeLoading && (
                                            <button
                                                onClick={() => router.push(`/workflow/${params.id}/execute`)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#001e80] text-white hover:bg-[#1636b0] transition-colors duration-200 shadow"
                                                title="Execute Workflow"
                                            >
                                                <Play className="h-4 w-4" />
                                                Execute
                                            </button>
                                        )}
                                    </div>
                                </h2>
                                {codeLoading ? (
                                    <Skeleton className="h-64 w-full" />
                                ) : (
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap shadow-inner border border-gray-800">
                                        {getHighlightedCode(workflowCode)}
                                    </pre>
                                )}
                            </div>
                        </div>

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Workflow</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this workflow? This action cannot be undone.
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
                                        onClick={handleDeleteWorkflow}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Deleting..." : "Delete Workflow"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Workflow Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Workflow</DialogTitle>
                                    <DialogDescription>
                                        Update your workflow details
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label htmlFor="edit-name" className="text-sm font-medium">
                                            Workflow Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="edit-name"
                                            value={editedWorkflow.name}
                                            onChange={(e) => setEditedWorkflow({ ...editedWorkflow, name: e.target.value })}
                                            placeholder="Enter workflow name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="edit-description" className="text-sm font-medium">
                                            Description
                                        </label>
                                        <Textarea
                                            id="edit-description"
                                            value={editedWorkflow.description}
                                            onChange={(e) => setEditedWorkflow({ ...editedWorkflow, description: e.target.value })}
                                            placeholder="Enter workflow description"
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
                                        onClick={handleUpdateWorkflow}
                                        disabled={isUpdating}
                                        className="bg-[#001e80] text-white"
                                    >
                                        {isUpdating ? "Updating..." : "Update Workflow"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : null}
            </main>

            {/* Add Toaster component at the end */}
            <Toaster />
        </div>
    );
} 