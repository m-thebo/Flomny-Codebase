"use client"

import { useState, useEffect } from "react"
import { Search, LogOut, Settings, Plus } from "lucide-react";
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import Logo from "@/assets/logosaas.png"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/screens/ui/toaster"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import ProjectList from "./ProjectList"
import RecentWorkflows from "./RecentWorkflows"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { projectService } from "@/services/projectService"

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Check authentication status
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth/signin")
      return
    }

    if (isAuthenticated === true) {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  const getUserInitials = () => {
    if (!user) return ""
    const firstInitial = user.firstname ? user.firstname.charAt(0).toUpperCase() : ""
    const lastInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : ""
    return `${firstInitial}${lastInitial}`
  }

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
      setIsCreateProjectOpen(false);
      setNewProject({ title: "", description: "" });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
        variant: "success",
      });
      // Trigger a custom event to refresh the project list
      window.dispatchEvent(new Event('projectCreated'));
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

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "success",
      });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
                onClick={() => router.push("/")}
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
                    ? "text-black"
                    : "text-black/60 hover:text-black/80"
                    }`}
                >
                  Community
                </Link>
                <Link
                  href="/integrations"
                  className={`text-sm font-medium ${pathname === "/integrations"
                    ? "text-black"
                    : "text-black/60 hover:text-black/80"
                    }`}
                >
                  Integrations
                </Link>
              </nav>
            </div>
            <div className="ml-auto flex items-center gap-4 relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/40" />
                <Input
                  type="search"
                  placeholder="Search workflows and projects..."
                  className="w-[200px] pl-8 md:w-[240px] lg:w-[320px] rounded-full bg-gray-100 border-gray-200 focus:border-black focus:ring-black"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

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
                      onClick={handleLogout}
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
      <main className="flex-1 container py-2">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-xl relative overflow-hidden py-4">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="md:w-2/3">
              <div className="w-fit rounded-full bg-[#E9EEFF] px-3 py-1 text-xs font-medium text-[#001e80]">
                Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text mt-3">
                Welcome, {user?.firstname || "User"}
              </h1>
              <p className="text-lg text-[#010d3e] tracking-tight mt-1 max-w-xl">
                Create AI-powered workflows to connect your apps and automate repetitive tasks effortlessly.
              </p>
            </div>
            <div className="mt-16">
              <div className="flex gap-4">
                <Link href="/workflow">
                  <Button className="bg-[#001e80] text-white px-6 py-2.5 rounded-lg font-medium tracking-tight hover:bg-[#001e80]/90 flex items-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
                    <Plus className="h-5 w-5" />
                    <span>New Workflow</span>
                  </Button>
                </Link>
                <Link href="/workflow-mcp">
                  <Button variant="outline" className="border-[#001e80]/30 text-[#001e80]/80 hover:bg-[#001e80]/5 hover:text-[#001e80] px-6 py-2.5 rounded-lg font-medium tracking-tight flex items-center gap-2 transition-all duration-200">
                    <span>Try MCP</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workflows */}
        <div className="mb-12">
          <div className="mb-6 text-left border-l-4 border-[#001e80] pl-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recents</h2>
            <p className="text-sm text-gray-500 mt-1">Your recently edited workflows</p>
          </div>
          <RecentWorkflows isLoading={isLoading} userId={user?.id} searchQuery={searchQuery} />
        </div>

        {/* Projects */}
        <div>
          <div className="mb-6 text-left border-l-4 border-[#001e80] pl-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h2>
            <p className="text-sm text-gray-500 mt-1">Organize your workflows into projects</p>
          </div>
          <ProjectList isLoading={isLoading} userId={user?.id} searchQuery={searchQuery} />
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
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-6 text-center mt-auto">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Image src={Logo || "/placeholder.svg"} height={30} alt="SaaS logo" className="relative" />
          </div>
          <p className="mt-4">&copy; 2024 Flomny.com, Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* Add Toaster component at the end */}
      <Toaster />
    </div>
  )
}

