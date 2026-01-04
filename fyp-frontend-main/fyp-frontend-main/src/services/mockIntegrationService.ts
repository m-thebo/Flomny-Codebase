// Mock data types
export interface Integration {
    id: string;
    displayName: string;
    public: boolean;
    uniqueName: string;
    description: string;
    createdBy: string;
    additionalInfo: {
        isFileBased: boolean;
        fileStatus: string;
        failedReason: string;
        publicBaseURL: string;
        documentationURL: string;
        isLocallyStored: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock data
const mockIntegrations: Integration[] = [
    {
        id: "1",
        displayName: "GitHub API",
        public: true,
        uniqueName: "github-api",
        description: "GitHub REST API integration for workflow automation",
        createdBy: "user1",
        additionalInfo: {
            isFileBased: true,
            fileStatus: "active",
            failedReason: "",
            publicBaseURL: "https://api.github.com",
            documentationURL: "https://docs.github.com/en/rest",
            isLocallyStored: false
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    },
    {
        id: "2",
        displayName: "Slack API",
        public: false,
        uniqueName: "slack-api",
        description: "Slack API integration for notifications and messaging",
        createdBy: "user1",
        additionalInfo: {
            isFileBased: true,
            fileStatus: "active",
            failedReason: "",
            publicBaseURL: "https://slack.com/api",
            documentationURL: "https://api.slack.com",
            isLocallyStored: false
        },
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02")
    }
];

// Mock service functions
export const mockIntegrationService = {
    // Create integration
    createIntegration: async (data: Omit<Integration, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<Integration> => {
        const newIntegration: Integration = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockIntegrations.push(newIntegration);
        return newIntegration;
    },

    // Get all integrations
    getIntegrations: async (): Promise<Integration[]> => {
        return mockIntegrations.filter(integration => !integration.deletedAt);
    },

    // Get integration by ID
    getIntegrationById: async (id: string): Promise<Integration | undefined> => {
        return mockIntegrations.find(integration => integration.id === id && !integration.deletedAt);
    },

    // Update integration
    updateIntegration: async (id: string, data: Partial<Integration>): Promise<Integration | undefined> => {
        const index = mockIntegrations.findIndex(integration => integration.id === id);
        if (index === -1) return undefined;

        const updatedIntegration = {
            ...mockIntegrations[index],
            ...data,
            updatedAt: new Date()
        };
        mockIntegrations[index] = updatedIntegration;
        return updatedIntegration;
    },

    // Delete integration (soft delete)
    deleteIntegration: async (id: string): Promise<boolean> => {
        const index = mockIntegrations.findIndex(integration => integration.id === id);
        if (index === -1) return false;

        mockIntegrations[index] = {
            ...mockIntegrations[index],
            deletedAt: new Date()
        };
        return true;
    },

    // Search integrations
    searchIntegrations: async (query: string): Promise<Integration[]> => {
        const searchTerm = query.toLowerCase();
        return mockIntegrations.filter(integration =>
            !integration.deletedAt && (
                integration.displayName.toLowerCase().includes(searchTerm) ||
                integration.description.toLowerCase().includes(searchTerm) ||
                integration.uniqueName.toLowerCase().includes(searchTerm)
            )
        );
    }
}; 