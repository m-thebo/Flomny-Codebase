import { useEffect, useState, useCallback, useRef } from 'react';
import workflowClient, { WorkflowWebSocketClient } from '../utils/websocketClient';
import { CreateWorkflowRequest } from '../types/workflow';

interface UseWorkflowWebSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface HumanInputRequest {
  request_id: string;
  message: string;
  feedback: string;
  current_query: string;
}

interface GenerationConfirmationRequest {
  request_id: string;
  message: string;
}

interface WorkflowWebSocketState {
  isConnected: boolean;
  clientId: string | null;
  logs: string[];
  status: string | null;
  tasks: any[] | null;
  generatedCode: string | null;
  error: string | null;
  activeNodeName: string | null;
  nodeHistory: string[];
  humanInputRequest: HumanInputRequest | null;
  generationConfirmationRequest: GenerationConfirmationRequest | null;
}

interface WorkflowWebSocketActions {
  connect: () => Promise<string>;
  disconnect: () => void;
  sendPrompt: (prompt: string, integrationIds: string[]) => void;
  clearLogs: () => void;
  clearAll: () => void;
  sendHumanInputResponse: (requestId: string, response: string) => void;
  sendGenerationConfirmationResponse: (requestId: string, confirmed: boolean, changes?: string) => void;
}

export const useWorkflowWebSocket = (options: UseWorkflowWebSocketOptions = {}): [
  WorkflowWebSocketState,
  WorkflowWebSocketActions
] => {
  const { serverUrl, autoConnect = false } = options;
  
  const [state, setState] = useState<WorkflowWebSocketState>({
    isConnected: false,
    clientId: null,
    logs: [],
    status: null,
    tasks: null,
    generatedCode: null,
    error: null,
    activeNodeName: null,
    nodeHistory: [],
    humanInputRequest: null,
    generationConfirmationRequest: null,
  });
  
  // Store client reference in a ref to avoid re-renders but keep latest reference
  const clientRef = useRef(workflowClient);
  
  // Set custom server URL if provided
  useEffect(() => {
    if (serverUrl) {
      console.log(`Setting up WebSocket client with URL: ${serverUrl}`);
      // First disconnect any existing connection
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      
      // Create a new client with the custom URL
      clientRef.current = new WorkflowWebSocketClient(serverUrl);
      
      // Reset state when URL changes
      setState(prev => ({
        ...prev,
        isConnected: false,
        clientId: null,
        error: null
      }));
      
      // Set up new handlers for the new client
      setupHandlers();
    }
  }, [serverUrl]);
  
  // Function to set up message handlers
  const setupHandlers = useCallback(() => {
    // Function to handle different message types
    const handleMessage = (message: any) => {
      console.log('Handling message in hook:', message);
      
      switch (message.type) {
        case 'log':
          setState(prev => ({
            ...prev,
            logs: [...prev.logs, message.content]
          }));
          break;
        case 'status':
          setState(prev => ({
            ...prev,
            status: message.content
          }));
          break;
        case 'tasks':
          setState(prev => ({
            ...prev,
            tasks: message.content
          }));
          break;
        case 'code':
          setState(prev => ({
            ...prev,
            generatedCode: message.content
          }));
          break;
        case 'error':
          setState(prev => ({
            ...prev,
            error: message.content
          }));
          break;
        case 'node':
          setState(prev => {
            const newNodeHistory = (prev.nodeHistory.length === 0 || prev.nodeHistory[prev.nodeHistory.length - 1] !== message.content)
              ? [...prev.nodeHistory, message.content]
              : prev.nodeHistory;
            return {
              ...prev,
              activeNodeName: message.content,
              nodeHistory: newNodeHistory,
              status: null,
              tasks: null,
              generatedCode: null
            };
          });
          break;
        case 'human_input_request':
          setState(prev => ({
            ...prev,
            humanInputRequest: message.content
          }));
          break;
        case 'generation_confirmation_request':
          setState(prev => ({
            ...prev,
            generationConfirmationRequest: message.content
          }));
          break;
      }
    };
    
    // Function to handle connection errors
    const handleError = (error: Event) => {
      console.error('WebSocket error in hook:', error);
      setState(prev => ({
        ...prev,
        error: 'WebSocket connection error',
        isConnected: false
      }));
    };
    
    // Function to handle successful connections
    const handleConnection = (clientId: string) => {
      console.log('Connection handler called with clientId:', clientId);
      if (clientId) {
        setState(prev => ({
          ...prev,
          clientId,
          isConnected: true,
          error: null
        }));
      } else {
        // Empty client ID means disconnection
        setState(prev => ({
          ...prev,
          clientId: null,
          isConnected: false
        }));
      }
    };
    
    // Register all handlers and store cleanup functions
    const client = clientRef.current;
    const removeMessageHandler = client.onMessage(handleMessage);
    const removeErrorHandler = client.onError(handleError);
    const removeConnectionHandler = client.onConnection(handleConnection);
    
    // Return cleanup function
    return () => {
      removeMessageHandler();
      removeErrorHandler();
      removeConnectionHandler();
    };
  }, []);
  
  // Set up message handlers on mount or when setupHandlers changes
  useEffect(() => {
    const cleanup = setupHandlers();
    
    return () => {
      cleanup();
      // Disconnect on unmount
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [setupHandlers]);
  
  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, serverUrl]);
  
  const connect = useCallback(async (): Promise<string> => {
    try {
      setState(prev => ({
        ...prev,
        error: null
      }));
      console.log('Connecting to WebSocket server...');
      const clientId = await clientRef.current.connect();
      return clientId;
    } catch (error) {
      console.error('Failed to connect in hook:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to WebSocket server'
      }));
      throw error;
    }
  }, []);
  
  const disconnect = useCallback(() => {
    clientRef.current.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      clientId: null
    }));
  }, []);
  
  const sendPrompt = useCallback((prompt: string, integrationIds: string[]) => {
    console.log('Integration IDs in sendPrompt:', integrationIds); // Debugging

    if (!integrationIds || integrationIds.length === 0) {
        console.error('No integrations selected. Cannot send prompt.');
        setState(prev => ({
            ...prev,
            error: 'No integrations selected. Please select at least one integration.'
        }));
        return;
    }

    try {
        const request: CreateWorkflowRequest = {
            user_prompt: prompt,
            integration_ids: integrationIds // Ensure integration IDs are included
        };
        console.log('Sending prompt with request:', request); // Debugging
        clientRef.current.sendPrompt(request);

        // Clear previous results when sending a new prompt
        setState(prev => ({
            ...prev,
            status: null,
            tasks: null,
            generatedCode: null,
            error: null,
            activeNodeName: null,
            nodeHistory: [],
            humanInputRequest: null,
            generationConfirmationRequest: null
        }));
    } catch (error) {
        console.error('Error sending prompt:', error);
        setState(prev => ({
            ...prev,
            error: 'Failed to send prompt. Are you connected?'
        }));
    }
}, []);

  const sendHumanInputResponse = useCallback((requestId: string, response: string) => {
    try {
      const message = {
        type: 'human_input_response',
        request_id: requestId,
        response: response
      };
      
      clientRef.current.send(message);
      
      // Clear the human input request from state
      setState(prev => ({
        ...prev,
        humanInputRequest: null
      }));
    } catch (error) {
      console.error('Error sending human input response:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send response'
      }));
    }
  }, []);

  const sendGenerationConfirmationResponse = useCallback((requestId: string, confirmed: boolean, changes?: string) => {
    try {
      const message = {
        type: 'generation_confirmation_response',
        request_id: requestId,
        confirmed: confirmed,
        ...(changes && { changes })
      };
      
      clientRef.current.send(message);
      
      // Clear the generation confirmation request from state
      setState(prev => ({
        ...prev,
        generationConfirmationRequest: null
      }));
    } catch (error) {
      console.error('Error sending generation confirmation response:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send confirmation response'
      }));
    }
  }, []);
  
  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      logs: []
    }));
  }, []);
  
  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      logs: [],
      status: null,
      tasks: null,
      generatedCode: null,
      error: null,
      activeNodeName: null,
      nodeHistory: [],
      humanInputRequest: null,
      generationConfirmationRequest: null
    }));
  }, []);
  
  return [
    {
      isConnected: state.isConnected,
      clientId: state.clientId,
      logs: state.logs,
      status: state.status,
      tasks: state.tasks,
      generatedCode: state.generatedCode,
      error: state.error,
      activeNodeName: state.activeNodeName,
      nodeHistory: state.nodeHistory,
      humanInputRequest: state.humanInputRequest,
      generationConfirmationRequest: state.generationConfirmationRequest
    },
    {
      connect,
      disconnect,
      sendPrompt,
      clearLogs,
      clearAll,
      sendHumanInputResponse,
      sendGenerationConfirmationResponse
    }
  ];
};