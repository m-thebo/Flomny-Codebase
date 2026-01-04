"use client"

import { useState, useEffect } from "react"
import { Search, Check, X } from "lucide-react"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { integrationService, Integration } from "@/services/integrationService"

interface IntegrationsSidePanelProps {
    onIntegrationsChange: (selectedIntegrations: Integration[]) => void;
}

export default function IntegrationsSidePanel({ onIntegrationsChange }: IntegrationsSidePanelProps) {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    // Duplicate declaration removed
    const [isLoading, setIsLoading] = useState(true);

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

    // Handle search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = await integrationService.searchIntegrations(query);
            setIntegrations(results);
        } else {
            const allIntegrations = await integrationService.getIntegrations();
            setIntegrations(allIntegrations);
        }
    };
    const [selectedIntegrations, setSelectedIntegrations] = useState<Integration[]>([]);


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
        onIntegrationsChange(newSelectedIntegrations); // Pass the entire Integration objects to the parent
    };

    return (
        <div className="w-80 border-l border-gray-200 bg-white h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Integrations</h2>
                <div className="relative">
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

            {/* Selected Integrations */}
            {selectedIntegrations.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Selected Integrations</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedIntegrations.map((integration) => (
                            <Badge
                                key={integration.id}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {integration.displayName}
                                <button
                                    onClick={() => toggleIntegration(integration)}
                                    className="ml-1 hover:text-gray-900"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Integrations List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : integrations.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No integrations found</div>
                    ) : (
                        integrations.map((integration) => {
                            const isSelected = selectedIntegrations.some(i => i.id === integration.id);
                            return (
                                <button
                                    key={integration.id}
                                    onClick={() => toggleIntegration(integration)}
                                    className={`w-full p-3 rounded-lg border text-left transition-colors ${isSelected
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
                                            <Check className="h-4 w-4 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}