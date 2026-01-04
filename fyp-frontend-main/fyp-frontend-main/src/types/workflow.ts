// Workflow types

// Request to create a workflow
export interface CreateWorkflowRequest {
    user_prompt: string;
    integration_ids: string[];
    // Add any additional parameters needed for your workflow
}

// Basic WebSocket message structure
export interface WebSocketMessage {
    type: string;
    content: any;
}

// Connection message from the server
export interface ConnectionMessage extends WebSocketMessage {
    type: 'connection';
    content: {
        client_id: string;
        message: string;
    };
}

// Log message from the server
export interface LogMessage extends WebSocketMessage {
    type: 'log';
    content: string;
}

// Status message from the server
export interface StatusMessage extends WebSocketMessage {
    type: 'status';
    content: string;
}

// Tasks message from the server
export interface TasksMessage extends WebSocketMessage {
    type: 'tasks';
    content: any[];
}

// Code message from the server
export interface CodeMessage extends WebSocketMessage {
    type: 'code';
    content: string;
}

// Error message from the server
export interface ErrorMessage extends WebSocketMessage {
    type: 'error';
    content: string;
}

//TODO: Add a list of integrations

// export interface Integration {
//     id: string;
//     sequence_no: number;
// }

