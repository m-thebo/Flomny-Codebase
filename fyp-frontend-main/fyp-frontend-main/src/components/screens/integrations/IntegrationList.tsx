"use client"

import { Integration } from "@/services/integrationService"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Edit, Trash2, Globe, Lock, ExternalLink, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface IntegrationListProps {
    integrations?: Integration[];
    onEdit: (integration: Integration) => void;
    onDelete: (id: string) => void;
    searchQuery?: string;
}

export default function IntegrationList({ integrations = [], onEdit, onDelete, searchQuery = "" }: IntegrationListProps) {
    const getDomainFromUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return domain.replace(/^www\./, '');
        } catch {
            return url;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
                <Card key={integration.id} className={`flex flex-col ${
                    searchQuery && (
                        (integration.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                        (integration.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                        (integration.uniqueName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
                    ) ? 'ring-2 ring-[#001e80] ring-opacity-50' : ''
                }`}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold line-clamp-1">{integration.displayName}</h3>
                                <p className="text-sm text-gray-500">{integration.uniqueName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={integration.public ? "default" : "secondary"}>
                                    {integration.public ? (
                                        <Globe className="h-4 w-4 mr-1" />
                                    ) : (
                                        <Lock className="h-4 w-4 mr-1" />
                                    )}
                                    {integration.public ? "Public" : "Private"}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(integration)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(integration.id)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

                        <div className="space-y-2">
                            {integration.additionalInfo.publicBaseURL && (
                                <div className="text-sm">
                                    <span className="font-medium">Base URL:</span>{" "}
                                    <a
                                        href={integration.additionalInfo.publicBaseURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        {getDomainFromUrl(integration.additionalInfo.publicBaseURL)}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                            {integration.additionalInfo.documentationURL && (
                                <div className="text-sm">
                                    <span className="font-medium">Documentation:</span>{" "}
                                    <a
                                        href={integration.additionalInfo.documentationURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        View Documentation
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 