"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import Logo from "@/assets/logosaas.png"
import { ArrowLeft, Plus, Search, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/screens/ui/button"
import { Input } from "@/components/screens/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/screens/ui/dialog"
import { integrationService, Integration } from "@/services/integrationService"
import IntegrationForm from "@/components/screens/integrations/IntegrationForm"
import IntegrationList from "@/components/screens/integrations/IntegrationList"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/screens/ui/toaster"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/screens/ui/avatar"

export default function IntegrationsPage() {
    const router = useRouter()
    const pathname = usePathname()
    const { isAuthenticated, user, logout } = useAuth()
    const { toast } = useToast()
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const getUserInitials = () => {
        if (!user) return ""
        const firstInitial = user.firstname ? user.firstname.charAt(0).toUpperCase() : ""
        const lastInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : ""
        return `${firstInitial}${lastInitial}`
    }

    // Check authentication status
    useEffect(() => {
        if (isAuthenticated === false) {
            router.push("/auth/signin")
            return
        }
    }, [isAuthenticated, router])

    // Load integrations
    useEffect(() => {
        const loadIntegrations = async () => {
            try {
                const data = await integrationService.getIntegrations()
                setIntegrations(data)
            } catch (error) {
                console.error("Error loading integrations:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadIntegrations()
    }, [])

    // Handle search
    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.trim()) {
            const results = await integrationService.searchIntegrations(query)
            setIntegrations(results)
        } else {
            const allIntegrations = await integrationService.getIntegrations()
            setIntegrations(allIntegrations)
        }
    }

    // Handle create
    const handleCreate = async (formData: any) => {
        try {
            setIsLoading(true)
            await integrationService.createIntegration({
                displayName: formData.displayName,
                uniqueName: formData.uniqueName,
                description: formData.description,
                base_url: formData.additionalInfo.publicBaseURL,
                documentation_url: formData.additionalInfo.documentationURL,
                public: formData.public,
                is_locally_stored: formData.additionalInfo.isLocallyStored,
            })
            setIsCreateDialogOpen(false)
            // Refresh integrations
            const data = await integrationService.getIntegrations()
            setIntegrations(data)
        } catch (error) {
            console.error("Error creating integration:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        setIntegrationToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!integrationToDelete) return

        try {
            setIsLoading(true)
            await integrationService.deleteIntegration(integrationToDelete)

            // Refresh the integrations list
            const data = await integrationService.getIntegrations()
            setIntegrations(data)

            toast({
                title: "Integration deleted",
                description: "The integration has been successfully deleted.",
                variant: "success",
            })
        } catch (error) {
            console.error("Error deleting integration:", error)
            toast({
                title: "Error",
                description: "Failed to delete integration. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsDeleteDialogOpen(false)
            setIntegrationToDelete(null)
        }
    }

    // Handle edit
    const handleEdit = async (formData: any) => {
        if (!selectedIntegration) return;

        try {
            setIsLoading(true);
            await integrationService.updateIntegration(selectedIntegration.id, {
                displayName: formData.displayName,
                uniqueName: formData.uniqueName,
                description: formData.description,
                base_url: formData.additionalInfo.publicBaseURL,
                documentation_url: formData.additionalInfo.documentationURL,
                public: formData.public,
                is_locally_stored: formData.additionalInfo.isLocallyStored,
            });

            // Refresh the integrations list
            const data = await integrationService.getIntegrations();
            setIntegrations(data);
            setIsEditDialogOpen(false);
            setSelectedIntegration(null);

            toast({
                title: "Integration updated",
                description: "The integration has been successfully updated.",
                variant: "success",
            });
        } catch (error) {
            console.error("Error updating integration:", error);
            toast({
                title: "Error",
                description: "Failed to update integration. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#D2DCFF]">
            {/* Header */}
            <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20 transition-all duration-300">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 md:gap-8">
                            <Image
                                src={Logo || "/placeholder.svg"}
                                alt="Saas Logo"
                                height={40}
                                width={40}
                                onClick={() => router.push("/dashboard")}
                                className="cursor-pointer"
                            />
                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/dashboard"
                                    className={`text-sm font-medium ${pathname.includes("/dashboard")
                                        ? "text-[#001e80] font-semibold"
                                        : "text-black/60 hover:text-black/80"
                                    }`}
                                >
                                    Workflow
                                </Link>
                                <Link
                                    href="/community"
                                    className={`text-sm font-medium ${pathname === "/community"
                                        ? "text-[#001e80] font-semibold"
                                        : "text-black/60 hover:text-black/80"
                                    }`}
                                >
                                    Community
                                </Link>
                                <Link
                                    href="/integrations"
                                    className={`text-sm font-medium ${pathname === "/integrations"
                                        ? "text-[#001e80] font-semibold"
                                        : "text-black/60 hover:text-black/80"
                                    }`}
                                >
                                    Integrations
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Avatar Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-100"
                                >
                                    <span className="text-sm font-semibold text-black">
                                        {getUserInitials()}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border p-3">
                                        <p className="text-sm text-gray-500 text-center">{user?.email}</p>

                                        <div className="mt-3 p-2 bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-200">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarFallback className="bg-black text-white">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-black">
                                                    {user?.firstname} {user?.lastname}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Settings Option */}
                                        <button
                                            onClick={() => router.push("/settings")}
                                            className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 w-full px-3 py-2 mt-2 rounded-md"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </button>

                                        {/* Logout Option */}
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-2 text-sm text-red-500 hover:bg-gray-100 w-full px-3 py-2 mt-2 rounded-md"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container py-8">
                {/* Page Title and Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 px-1">
                    <div>
                        <div className="inline-flex rounded-full bg-[#E9EEFF] px-3 py-1 text-xs font-medium text-[#001e80] mb-3">
                            Integrations
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text">
                            Integrations
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Connect your favorite tools and services to automate your workflows
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/40" />
                            <Input
                                type="search"
                                placeholder="Search integrations..."
                                className="w-full md:w-[240px] pl-8"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Integration
                        </Button>
                    </div>
                </div>

                {/* Integrations List */}
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : (
                    <IntegrationList
                        integrations={integrations}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        searchQuery={searchQuery}
                    />
                )}
            </main>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Integration</DialogTitle>
                    </DialogHeader>
                    <IntegrationForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Integration</DialogTitle>
                    </DialogHeader>
                    {selectedIntegration && (
                        <IntegrationForm
                            initialData={selectedIntegration}
                            onSubmit={handleEdit}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedIntegration(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Integration</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this integration? This action cannot be undone.</p>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setIntegrationToDelete(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Toast */}
            <Toaster />

            {/* Footer */}
            <footer className="bg-black text-[#BCBCBC] text-sm py-6 text-center mt-auto">
                <div className="container">
                    <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
                        <Image src={Logo || "/placeholder.svg"} height={30} alt="SaaS logo" className="relative" />
                    </div>
                    <p className="mt-4">&copy; 2024 Flomny.com, Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
} 