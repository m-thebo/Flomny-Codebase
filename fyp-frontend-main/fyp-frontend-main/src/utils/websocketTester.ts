/**
 * WebSocket Connection Tester
 * 
 * This utility helps diagnose WebSocket connection issues by testing:
 * 1. Basic connectivity to the server
 * 2. Standard WebSocket handshake
 * 3. Protocol compatibility
 */

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const testWebSocketConnection = async (url: string): Promise<TestResult> => {
  try {
    console.log(`Testing WebSocket connection to: ${url}`);
    
    // Verify URL format
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      return {
        success: false,
        message: 'Invalid WebSocket URL. Must start with ws:// or wss://'
      };
    }
    
    // Try creating a WebSocket connection
    const socket = new WebSocket(url);
    
    // Set up a promise to track connection status
    const connectionPromise = new Promise<TestResult>((resolve, reject) => {
      // Connection timeout
      const timeout = setTimeout(() => {
        socket.close();
        resolve({
          success: false,
          message: 'Connection timed out after 10 seconds'
        });
      }, 10000);
      
      socket.onopen = () => {
        clearTimeout(timeout);
        console.log('Test connection opened successfully');
        resolve({
          success: true,
          message: 'WebSocket connection established successfully',
          details: {
            protocol: socket.protocol,
            readyState: socket.readyState
          }
        });
        
        // Close after successful test
        setTimeout(() => socket.close(), 1000);
      };
      
      socket.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Test connection error:', error);
        reject(new Error('Failed to establish WebSocket connection'));
      };
      
      socket.onclose = (event) => {
        clearTimeout(timeout);
        if (!event.wasClean) {
          reject(new Error(`Connection closed abnormally. Code: ${event.code}, Reason: ${event.reason || 'Unknown'}`));
        }
      };
    });
    
    return await connectionPromise;
  } catch (error) {
    console.error('WebSocket connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    };
  }
};

/**
 * Attempts to format and diagnose WebSocket errors
 */
export const diagnoseBrowserWebSocketError = (error: any): string => {
  if (!error) return 'Unknown error';
  
  // Common WebSocket error codes
  const errorCodes: Record<number, string> = {
    1000: 'Normal closure',
    1001: 'Going away',
    1002: 'Protocol error',
    1003: 'Unsupported data',
    1004: 'Reserved',
    1005: 'No status received',
    1006: 'Abnormal closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Mandatory extension',
    1011: 'Internal server error',
    1012: 'Service restart',
    1013: 'Try again later',
    1014: 'Bad gateway',
    1015: 'TLS handshake'
  };
  
  // Extract code from various error objects
  let code: number | null = null;
  
  if (typeof error === 'object') {
    if ('code' in error) code = Number(error.code);
    else if ('status' in error) code = Number(error.status);
  }
  
  // Provide specific guidance based on error code
  if (code !== null && errorCodes[code]) {
    return `${errorCodes[code]} (Code: ${code}). ${getErrorAdvice(code)}`;
  }
  
  // Use error message if available
  if (error instanceof Error) {
    return error.message;
  }
  
  // Default case
  return String(error);
};

/**
 * Get advice for specific WebSocket error codes
 */
function getErrorAdvice(code: number): string {
  switch (code) {
    case 1001:
      return 'The server is shutting down or browser window is closing.';
    case 1002:
      return 'The client and server have incompatible WebSocket protocols.';
    case 1006:
      return 'Connection was closed abnormally. This could be due to network issues, firewall, or browser support.';
    case 1007:
    case 1008:
      return 'The server rejected the connection. Check authentication requirements.';
    case 1009:
      return 'Message size exceeded limits.';
    case 1011:
      return 'The server encountered an unexpected condition. Check server logs.';
    case 1015:
      return 'TLS handshake failed. Check SSL certificate or mixed content policies.';
    default:
      return 'Check browser console for more details.';
  }
} 