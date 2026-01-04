"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Search, User, Globe, Lock, MoreVertical, ExternalLink, ChevronLeft, ChevronRight, Settings, LogOut } from "lucide-react";
import { communityService, CommunityItem, PaginatedResponse } from "@/services/communityService";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logosaas.png";
import { Input } from "@/components/screens/ui/input";
import { Badge } from "@/components/screens/ui/badge";
import { Button } from "@/components/screens/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/screens/ui/avatar";

const ITEMS_PER_PAGE = 5;

export default function CommunityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"workflows" | "integrations">("workflows");
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Check authentication status
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth/signin");
      return;
    }
  }, [isAuthenticated, router]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      if (query.trim()) {
        const results = activeTab === "workflows" 
          ? await communityService.getWorkflows(0, ITEMS_PER_PAGE, query)
          : await communityService.getIntegrations(0, ITEMS_PER_PAGE, query);
        const newItems = activeTab === "workflows" ? results.workflows : results.integrations;
        // Filter items based on search query
        const filteredItems = (newItems || []).filter(item => {
          const searchTerm = query.toLowerCase();
          return (
            (item.name?.toLowerCase().includes(searchTerm) || false) ||
            (item.displayName?.toLowerCase().includes(searchTerm) || false) ||
            (item.description?.toLowerCase().includes(searchTerm) || false) ||
            (item.createdBy?.toLowerCase().includes(searchTerm) || false)
          );
        });
        setItems(filteredItems);
        setTotal(filteredItems.length);
      } else {
        const allItems = activeTab === "workflows"
          ? await communityService.getWorkflows(0, ITEMS_PER_PAGE)
          : await communityService.getIntegrations(0, ITEMS_PER_PAGE);
        const newItems = activeTab === "workflows" ? allItems.workflows : allItems.integrations;
        setItems(newItems || []);
        setTotal(allItems.total);
      }
    } catch (error) {
      console.error("Error searching items:", error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (pageNum: number) => {
    setLoading(true);
    try {
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      const response = activeTab === "workflows" 
        ? await communityService.getWorkflows(offset, ITEMS_PER_PAGE)
        : await communityService.getIntegrations(offset, ITEMS_PER_PAGE);
      
      const newItems = activeTab === "workflows" ? response.workflows : response.integrations;
      setTotal(response.total);
      
      if (newItems && newItems.length > 0) {
        setItems(newItems);
      } else {
        setItems([]);
      }
    } catch (error: any) {
      console.error("Error fetching items:", error);
      if (error.response?.status === 401) {
        router.push("/auth/signin");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchItems when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(1);
      setSearchQuery("");
      fetchItems(1);
    }
  }, [activeTab, isAuthenticated]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchItems(newPage);
    }
  };

  const getUserInitials = () => {
    if (!user) return "";
    const firstInitial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "";
    const lastInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 px-0">
          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-[#E9EEFF] px-3 py-1 text-xs font-medium text-[#001e80]">
              Community
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text">
              Community
            </h1>
            <p className="text-gray-600">
              Discover and explore community workflows and integrations
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/40" />
              <Input
                type="search"
                placeholder="Search community..."
                className="w-full md:w-[240px] pl-8"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="workflows" onValueChange={(value) => setActiveTab(value as "workflows" | "integrations")}>
          <TabsList className="mb-6 bg-[#E9EEFF] p-1 rounded-lg w-full px-0">
            <TabsTrigger 
              value="workflows"
              className="flex-1 h-10 text-sm data-[state=active]:bg-white data-[state=active]:text-[#001e80] data-[state=active]:shadow-sm"
            >
              Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="integrations"
              className="flex-1 h-10 text-sm data-[state=active]:bg-white data-[state=active]:text-[#001e80] data-[state=active]:shadow-sm"
            >
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows">
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#001e80]" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No matching workflows found" : "No workflows available"}
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.id}-${index}-${activeTab}`}>
                    <Link href={`/workflow/${item.id}`} className="block">
                      <Card className={`flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-[#001e80] ${
                        searchQuery && (
                          (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (item.createdBy?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
                        ) ? 'ring-2 ring-[#001e80] ring-opacity-50' : ''
                      }`}>
                        <div className="px-5 py-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <h3 className="text-base font-semibold">
                                  {activeTab === "workflows" ? item.name : item.displayName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  by {item.createdBy}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1.5 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 ml-6">
                              <Badge variant={item.public ? "default" : "secondary"} className="whitespace-nowrap">
                                {item.public ? (
                                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                {item.public ? "Public" : "Private"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#001e80]" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No matching integrations found" : "No integrations available"}
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.id}-${index}-${activeTab}`}>
                    <Card className={`flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow ${
                      searchQuery && (
                        (item.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                        (item.createdBy?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
                      ) ? 'ring-2 ring-[#001e80] ring-opacity-50' : ''
                    }`}>
                      <div className="px-5 py-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <h3 className="text-base font-semibold">
                                {activeTab === "workflows" ? item.name : item.displayName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                by {item.createdBy}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1.5 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 ml-6">
                            <Badge variant={item.public ? "default" : "secondary"} className="whitespace-nowrap">
                              {item.public ? (
                                <Globe className="h-3.5 w-3.5 mr-1.5" />
                              ) : (
                                <Lock className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              {item.public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{items.length}</span> of <span className="font-semibold text-gray-700">{total}</span> items
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="h-9 w-9 p-0 hover:bg-[#E9EEFF] hover:text-[#001e80] disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`h-9 w-9 p-0 ${
                    currentPage === pageNum 
                      ? "bg-[#001e80] text-white hover:bg-[#001e80]/90" 
                      : "hover:bg-[#E9EEFF] hover:text-[#001e80]"
                  }`}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="h-9 w-9 p-0 hover:bg-[#E9EEFF] hover:text-[#001e80] disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 