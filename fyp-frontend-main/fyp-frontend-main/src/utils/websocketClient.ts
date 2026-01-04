// WebSocket client for the workflow
import { CreateWorkflowRequest } from '../types/workflow';

interface WebSocketMessage {
  type: 'connection' | 'log' | 'status' | 'tasks' | 'code' | 'error' | 'node' | 'human_input_request' | 'generation_confirmation_request';
  content: any;
}

interface ConnectionMessage extends WebSocketMessage {
  type: 'connection';
  content: {
    client_id: string;
    message: string;
  };
}

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = (clientId: string) => void;

export class WorkflowWebSocketClient {
  private socket: WebSocket | null = null;
  private serverUrl: string;
  private clientId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectTimeout: number = 2000; // 2 seconds

  constructor(serverUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws') {
    // Handle URL formatting
    this.serverUrl = serverUrl;

    // If we're in a browser and using a secure connection, ensure WebSocket is also secure
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && this.serverUrl.startsWith('ws://')) {
      this.serverUrl = this.serverUrl.replace('ws://', 'wss://');
      console.log(`Updated WebSocket URL to use secure connection: ${this.serverUrl}`);
    }
  }

  public connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Close existing connection if any
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }

        console.log(`Attempting to connect to: ${this.serverUrl}`);
        this.socket = new WebSocket(this.serverUrl);

        // Add a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            const error = new Error('Connection timeout');
            console.error('WebSocket connection timed out');
            this.handleConnectionFailure(error);
            reject(error);
          }
        }, 10000); // 10 seconds timeout

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;

          // Some WebSocket servers don't send an initial message
          // If that's the case, we might need to resolve the connection here
          // and set a dummy client ID
          if (this.serverUrl.includes('localhost')) {
            // For testing: wait 2 seconds and if no client ID, create one
            setTimeout(() => {
              if (!this.clientId && this.socket?.readyState === WebSocket.OPEN) {
                this.clientId = 'default-client-' + Date.now();
                this.connectionHandlers.forEach(handler => handler(this.clientId!));
                resolve(this.clientId);
              }
            }, 2000);
          }
        };

        this.socket.onmessage = (event) => {
          try {
            console.log('Received message:', event.data);
            const data = JSON.parse(event.data) as WebSocketMessage;

            // Handle initial connection message with client ID
            if (data.type === 'connection' && data.content?.client_id) {
              clearTimeout(connectionTimeout);
              const connectionData = data as ConnectionMessage;
              this.clientId = connectionData.content.client_id;
              console.log(`Connected with client ID: ${this.clientId}`);
              console.log(`Server: ${connectionData.content.message}`);

              // Notify connection handlers
              this.connectionHandlers.forEach(handler => handler(this.clientId!));
              resolve(this.clientId);
            }

            // Process the message with all registered handlers
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data);
            // Don't reject here, as this could be a later message after successful connection
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(connectionTimeout);
          this.handleConnectionFailure(error);
          this.errorHandlers.forEach(handler => handler(error));

          // Only reject if we haven't already resolved
          if (!this.clientId) {
            reject(error);
          }
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: code ${event.code}, reason: ${event.reason}`);
          clearTimeout(connectionTimeout);
          this.socket = null;

          if (this.clientId) {
            // We had a connection before, so this is a disconnect
            this.clientId = null;
            // Notify that we're no longer connected
            this.connectionHandlers.forEach(handler => handler(''));
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.handleConnectionFailure(error as Error);
        reject(error);
      }
    });
  }

  private handleConnectionFailure(error: Error | Event): void {
    // Implement reconnection logic if needed
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Connection attempt ${this.reconnectAttempts} failed. Retrying in ${this.reconnectTimeout / 1000} seconds...`);

      setTimeout(() => {
        this.connect().catch(() => {
          // Just log, don't throw - we're already handling the error
          console.log('Reconnection attempt failed');
        });
      }, this.reconnectTimeout);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
      this.socket = null;
      this.clientId = null;
    }
  }

  public sendPrompt(request: CreateWorkflowRequest): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    console.log(`Sending prompt: ${request.user_prompt} with integrations: ${request.integration_ids.join(', ')}`);
    const jsonString = JSON.stringify(request);
    console.log('Sending WebSocket data:', jsonString);
    this.socket.send(jsonString);
  }

  public send(message: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const jsonString = JSON.stringify(message);
    console.log('Sending WebSocket message:', jsonString);
    this.socket.send(jsonString);
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  public onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public getClientId(): string | null {
    return this.clientId;
  }
}

// Create a singleton instance
const workflowClient = new WorkflowWebSocketClient();

export default workflowClient;