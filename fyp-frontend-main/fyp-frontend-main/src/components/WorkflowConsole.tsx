'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkflowWebSocket } from '../hooks/useWorkflowWebSocket';
import { Send, Trash2, Code, User, Bot, ArrowRight, Loader2, Pencil, Check, X, ChevronRight, PanelLeftClose, PanelLeftOpen, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkflowNodeDiagram } from './WorkflowNodeDiagram';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/screens/ui/dialog';
import { Button } from '@/components/screens/ui/button';
import { Textarea } from '@/components/screens/ui/textarea';
import { Input } from '@/components/screens/ui/input';


interface WorkflowConsoleProps {
  serverUrl?: string;
  autoConnect?: boolean;
  selectedIntegrationIds: string[];
  onSaveWorkflow?: (code: string, tasksDescription?: string) => void;
  onBackToWorkflow?: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'system' | 'processing' | 'logs';
  content: string;
  timestamp: Date;
  generatedCode?: string;
  editedCode?: string; // Track edited code separately
  isTyping?: boolean;
  displayedContent?: string;
  typingSpeed?: number; // Speed variation for more natural typing
  pauseEnd?: number; // Time when current pause ends
  isEditingCode?: boolean; // Track if currently editing code
  logs?: string[]; // Array of log messages
  isExpanded?: boolean;
  humanInputRequest?: any;
  generationConfirmationRequest?: any;
  codeHeight?: number;
  codeWidth?: string;
}

export const WorkflowConsole: React.FC<WorkflowConsoleProps> = ({
  serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws',
  autoConnect = false,
  selectedIntegrationIds = [],
  onSaveWorkflow,
  onBackToWorkflow,
}) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIntegrationPanelOpen, setIsIntegrationPanelOpen] = useState(false);
  const [isNodeDiagramVisible, setIsNodeDiagramVisible] = useState(true);
  const [diagramWidth, setDiagramWidth] = useState(280);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageScrollPosition, setPageScrollPosition] = useState(0);
  const [chatScrollPosition, setChatScrollPosition] = useState(0);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [lastExpandedPosition, setLastExpandedPosition] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Human Input Dialog States
  const [humanInputDialogOpen, setHumanInputDialogOpen] = useState(false);
  const [humanInputResponse, setHumanInputResponse] = useState('');

  // Generation Confirmation Dialog States
  const [generationConfirmationDialogOpen, setGenerationConfirmationDialogOpen] = useState(false);
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesText, setChangesText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Add state to track if we should restore connection
  const [shouldRestoreConnection, setShouldRestoreConnection] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "";
    const firstInitial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "";
    const lastInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const [
    { isConnected, clientId, logs, status, tasks, generatedCode, error, activeNodeName, nodeHistory, humanInputRequest, generationConfirmationRequest },
    { connect, disconnect, sendPrompt, clearLogs, clearAll, sendHumanInputResponse, sendGenerationConfirmationResponse }
  ] = useWorkflowWebSocket({ serverUrl, autoConnect });

  // Add effect to save page scroll position before any state changes
  useEffect(() => {
    const handleScroll = () => {
      setPageScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add effect to restore page scroll position after state changes
  useEffect(() => {
    window.scrollTo(0, pageScrollPosition);
  }, [messages.length, isProcessing, expandedCode, isNodeDiagramVisible]);

  // Save scroll position before adding new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Only capture scroll position if user has scrolled up (not at bottom)
      const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 20;

      if (isScrolledUp) {
        setScrollPosition(container.scrollTop);
      }
    }
  }, [prompt, isConnected]);

  // Restore scroll position or scroll to bottom for new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;

      // If there was a saved scroll position from user scrolling up, maintain it
      if (scrollPosition > 0) {
        container.scrollTop = scrollPosition;
      }
      // Otherwise if we're at the bottom, scroll to the new content
      else if (chatEndRef.current && messages.length > 0) {
        // Smooth scroll only for new messages, not initial load
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messages.length, scrollPosition]);

  // Enhanced typing animation effect for system messages
  useEffect(() => {
    const typingMessages = messages.filter(m => m.type === 'system' && m.isTyping);

    if (typingMessages.length > 0) {
      const message = typingMessages[0];
      const fullContent = message.content;
      const displayedContent = message.displayedContent || '';

      if (displayedContent.length < fullContent.length) {
        // Calculate delay based on character and context
        const nextChar = fullContent.charAt(displayedContent.length);
        let delay = message.typingSpeed || 15; // Reduced base typing speed from 30 to 15

        // If there's a current pause and it's not over yet, don't add new characters
        if (message.pauseEnd && Date.now() < message.pauseEnd) {
          const timeoutId = setTimeout(() => {
            // Just trigger a re-render to check again
            setMessages(prev => [...prev]);
          }, 50);
          return () => clearTimeout(timeoutId);
        }

        // Natural typing speed variations
        if (['.', '!', '?', '\n'].includes(nextChar)) {
          // Reduced pause duration after sentence endings and paragraphs
          const pauseDuration = nextChar === '\n' ? 200 : 150; // Reduced from 500/300 to 200/150

          const timeoutId = setTimeout(() => {
            const newDisplayedContent = displayedContent + nextChar;
            setMessages(prev =>
              prev.map(m =>
                m.id === message.id
                  ? {
                    ...m,
                    displayedContent: newDisplayedContent,
                    isTyping: newDisplayedContent.length < fullContent.length,
                    pauseEnd: Date.now() + pauseDuration,
                    typingSpeed: Math.floor(Math.random() * 10) + 10 // Reduced random variation
                  }
                  : m
              )
            );
          }, delay);

          return () => clearTimeout(timeoutId);
        } else if ([',', ';', ':'].includes(nextChar)) {
          // Reduced pause after commas and other punctuation
          delay = 50; // Reduced from 100 to 50
        } else if (nextChar === ' ') {
          // Very slight variation between words
          delay = 20; // Reduced from 40 to 20
        } else {
          // Random variation for individual characters for natural feel
          delay = Math.max(8, delay + (Math.random() * 5 - 2.5)); // Reduced minimum delay and variation
        }

        const timeoutId = setTimeout(() => {
          // Add one character at a time
          const newDisplayedContent = displayedContent + nextChar;

          setMessages(prev =>
            prev.map(m =>
              m.id === message.id
                ? {
                  ...m,
                  displayedContent: newDisplayedContent,
                  isTyping: newDisplayedContent.length < fullContent.length,
                  typingSpeed: delay
                }
                : m
            )
          );
        }, delay);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages]);

  // Show processing message when prompt is sent and remove when tasks are received
  useEffect(() => {
    if (isProcessing && tasks) {
      setIsProcessing(false);

      // Remove processing message when tasks are received
      setMessages(prev => prev.filter(m => m.type !== 'processing'));
    }
  }, [tasks, isProcessing]);

  // Handle logs display
  useEffect(() => {
    if (logs && logs.length > 0) {
      // Create a new logs message
      const newMessageId = `logs-${Date.now()}`;

      setMessages(prev => {
        // Remove any existing logs messages and processing message
        const filteredMessages = prev.filter(m => m.type !== 'logs' && m.type !== 'processing');

        // Get unique logs
        const uniqueLogs = [...new Set(logs)];

        return [
          ...filteredMessages,
          {
            id: newMessageId,
            type: 'logs',
            content: 'Thinking...',
            timestamp: new Date(),
            logs: uniqueLogs,
            isTyping: true,
            isExpanded: false
          }
        ];
      });
    }
  }, [logs]);

  // Update messages when tasks or generated code changes
  useEffect(() => {
    if (tasks) {
      const taskDescriptions = getTaskDescriptions();
      if (taskDescriptions.length > 0) {
        // Create a new system message with task description and typing animation
        const newMessageId = `system-${Date.now()}`;
        const content = taskDescriptions.join('\n\n');

        setMessages(prev => {
          // Find the logs message
          const logsMessage = prev.find(m => m.type === 'logs');
          
          // Update logs message to remove loading state when code is generated
          const updatedMessages = prev.map(m =>
            m.type === 'logs' && generatedCode
              ? { ...m, content: 'Log', isTyping: false }
              : m
          );

          // Remove any previous system messages with the same content
          const filteredMessages = updatedMessages.filter(m => !(m.type === 'system' && m.content === content));

          // Ensure logs message appears before system message
          const otherMessages = filteredMessages.filter(m => m.type !== 'logs');

          return [
            ...otherMessages.filter(m => m.type !== 'processing'),
            ...(logsMessage ? [logsMessage] : []),
            {
              id: newMessageId,
              type: 'system',
              content: content,
              displayedContent: '',
              isTyping: true,
              timestamp: new Date(),
              generatedCode: generatedCode || undefined,
              typingSpeed: 30,
              pauseEnd: 0
            }
          ];
        });

        // Automatically expand the code for the latest message when typing is done
        if (generatedCode) {
          const typingTimeEstimate = content.length * 30 +
            (content.match(/[.!?\n]/g) || []).length * 300 +
            (content.match(/[,;:]/g) || []).length * 100;

          setTimeout(() => {
            setExpandedCode(newMessageId);
          }, typingTimeEstimate + 500);
        }
      }
    }
  }, [tasks, generatedCode]);

  // Ensure logs message is updated to 'Log' and no loading animation once code is generated
  useEffect(() => {
    if (generatedCode) {
      setMessages(prev =>
        prev.map(m =>
          m.type === 'logs' ? { ...m, content: 'Log', isTyping: false } : m
        )
      );
    }
  }, [generatedCode]);

  // Clear connect error when URL changes or on successful connection
  useEffect(() => {
    if (isConnected) {
      setConnectError(null);
    }
  }, [isConnected, serverUrl]);

  // Resize handler for the diagram panel
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
  }, []);

  const handleMouseMoveResize = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current || !mainContainerRef.current) return;
    const newWidth = e.clientX - mainContainerRef.current.getBoundingClientRect().left;
    // Set min and max width for the diagram panel
    if (newWidth > 200 && newWidth < mainContainerRef.current.clientWidth - 300) {
      setDiagramWidth(newWidth);
    }
  }, []);

  const handleMouseUpResize = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMoveResize);
    document.removeEventListener('mouseup', handleMouseUpResize);
  }, []);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };
  }, [handleMouseMoveResize, handleMouseUpResize]);


  // Handle Human Input Request
  useEffect(() => {
    if (humanInputRequest) {
      // Add human input request as a system message
      setMessages(prev => [
        ...prev,
        {
          id: `human-input-${Date.now()}`,
          type: 'system',
          content: `🔧 Query Validation Failed\n\n${humanInputRequest.message}\n\n${humanInputRequest.feedback ? `Feedback: ${humanInputRequest.feedback}\n\n` : ''}${humanInputRequest.current_query ? `Current Query: ${humanInputRequest.current_query}\n\n` : ''}Please provide a revised query:`,
          timestamp: new Date(),
          isTyping: true,
          humanInputRequest: humanInputRequest
        }
      ]);
    }
  }, [humanInputRequest]);

  // Handle Generation Confirmation Request
  useEffect(() => {
    if (generationConfirmationRequest) {
      // Add generation confirmation request as a system message
      setMessages(prev => [
        ...prev,
        {
          id: `generation-confirm-${Date.now()}`,
          type: 'system',
          content: `🚀 Ready to Generate\n\n${generationConfirmationRequest.message}\n\nWould you like to make any changes before we generate your integration code?`,
          timestamp: new Date(),
          isTyping: true,
          generationConfirmationRequest: generationConfirmationRequest
        }
      ]);
    }
  }, [generationConfirmationRequest]);

  // Add effect to handle chat container scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const handleChatScroll = () => {
        const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 20;
        setIsUserScrolledUp(isScrolledUp);
        setChatScrollPosition(container.scrollTop);
      };

      container.addEventListener('scroll', handleChatScroll);
      return () => container.removeEventListener('scroll', handleChatScroll);
    }
  }, []);

  // Add effect to handle chat container scroll position for all messages
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      // Always jump to bottom for new messages
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    }
  }, [messages.length]);

  // Add effect to handle page scroll position when expanding/contracting
  useEffect(() => {
    if (expandedCode) {
      // Save the current page position when expanding
      setLastExpandedPosition(window.scrollY);
    } else {
      // Restore the last expanded position when contracting
      window.scrollTo(0, lastExpandedPosition);
    }
  }, [expandedCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && isConnected) {
      // Save current page scroll position
      setPageScrollPosition(window.scrollY);
      if (expandedCode) {
        setLastExpandedPosition(window.scrollY);
      }

      // Add user message
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: 'user',
          content: prompt.trim(),
          timestamp: new Date()
        }
      ]);

      // Add processing message
      setMessages(prev => [
        ...prev,
        {
          id: `processing-${Date.now()}`,
          type: 'processing',
          content: 'Processing your request...',
          timestamp: new Date()
        }
      ]);

      // Set processing state
      setIsProcessing(true);

      // Send prompt to server
      sendPrompt(prompt.trim(), selectedIntegrationIds);
      setPrompt('');

      // Restore page scroll position after a short delay
      setTimeout(() => {
        window.scrollTo(0, pageScrollPosition);
      }, 0);
    }
  };

  const handleConnect = async () => {
    try {
      setConnectError(null);
      // Only clear messages if we're not restoring connection
      if (!shouldRestoreConnection) {
        setMessages([]);
        clearAll();
        setExpandedCode(null);
        setPrompt('');
        setIsProcessing(false);
      }
      
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
      if (err instanceof Error) {
        setConnectError(err.message);
      } else {
        setConnectError('Connection failed with an unknown error');
      }
    }
  };

  // Extract task descriptions for cleaner display
  const getTaskDescriptions = () => {
    if (!tasks) return [];

    try {
      // If tasks is a string, try to parse it as JSON
      const taskData = typeof tasks === 'string' ? JSON.parse(tasks) : tasks;

      // If taskData is an object with key-value pairs where values are tasks
      if (typeof taskData === 'object' && taskData !== null && !Array.isArray(taskData)) {
        const descriptions = Object.values(taskData).map(task => {
          if (typeof task === 'object' && task !== null && 'task_description' in task) {
            return task.task_description;
          } else if (typeof task === 'string') {
            return task;
          } else {
            return 'Task description not available';
          }
        });
        // Remove duplicates while preserving order
        return [...new Set(descriptions)];
      }

      // If taskData is an array of tasks
      if (Array.isArray(taskData)) {
        const descriptions = taskData.map(task => {
          if (typeof task === 'object' && task !== null && 'task_description' in task) {
            return task.task_description;
          } else if (typeof task === 'string') {
            return task;
          } else {
            return 'Task description not available';
          }
        });
        // Remove duplicates while preserving order
        return [...new Set(descriptions)];
      }

      // If taskData is a single task object
      if (typeof taskData === 'object' && taskData !== null && 'task_description' in taskData) {
        return [taskData.task_description];
      }

      // Fallback: return the stringified task data
      return [JSON.stringify(taskData)];
    } catch (e) {
      console.error('Error parsing tasks:', e);
      // If parsing fails, try to handle as a string or default to empty array
      return typeof tasks === 'string' ? [tasks] : [];
    }
  };

  // Modify toggleCodeExpansion to handle chat scroll and page position
  const toggleCodeExpansion = (messageId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Save current page scroll position
    setPageScrollPosition(window.scrollY);

    // Save current chat scroll position
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 20;
      setIsUserScrolledUp(isScrolledUp);
      setChatScrollPosition(container.scrollTop);
    }
    
    if (expandedCode === messageId) {
      // Save position before contracting
      setLastExpandedPosition(window.scrollY);
      setExpandedCode(null);
    } else {
      // Save position before expanding
      setLastExpandedPosition(window.scrollY);
      setExpandedCode(messageId);
    }
  };

  // Toggle code editing mode
  const toggleCodeEditing = (messageId: string, startEditing: boolean) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          // If starting to edit, set editedCode to current generatedCode
          // If canceling edit, discard changes (editedCode)
          return {
            ...m,
            isEditingCode: startEditing,
            editedCode: startEditing ? m.generatedCode : undefined
          };
        }
        return m;
      })
    );
  };

  // Handle code changes in edit mode
  const handleCodeChange = (messageId: string, newCode: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, editedCode: newCode }
          : m
      )
    );
  };

  // Save edited code
  const saveEditedCode = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && m.editedCode !== undefined) {
          return {
            ...m,
            generatedCode: m.editedCode,
            editedCode: undefined,
            isEditingCode: false
          };
        }
        return m;
      })
    );
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClearChat = () => {
    // Stop any ongoing processing first
    setIsProcessing(false);
    
    // Clear messages and state before disconnecting
    setMessages([]);
    clearAll();
    setExpandedCode(null);
    
    // Clear any pending prompts
    setPrompt('');
    
    // Disconnect from WebSocket last
    disconnect();
  };

  // Add this function to handle log expansion
  const toggleLogsExpansion = (messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, isExpanded: !m.isExpanded }
          : m
      )
    );
  };

  // Modify the save workflow handler
  const handleSaveLatestCode = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onSaveWorkflow) {
      // Find the latest system message with generated code
      const latestMessage = [...messages].reverse().find(m => m.type === 'system' && m.generatedCode);
      
      if (latestMessage?.generatedCode) {
        // Get task descriptions to use as workflow description
        const taskDescriptions = getTaskDescriptions();
        const tasksDescription = taskDescriptions.join('\n\n');
        onSaveWorkflow(latestMessage.generatedCode, tasksDescription);
        
        // Set flag to restore connection when coming back
        setShouldRestoreConnection(true);
      }
    }
  };

  // Add handler for back to workflow button in save dialog
  const handleBackToWorkflowFromSave = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setShouldRestoreConnection(true);
    if (onBackToWorkflow) {
      onBackToWorkflow();
    }
  };

  // Add effect to handle restoration when selectedIntegrationIds changes
  useEffect(() => {
    if (selectedIntegrationIds.length > 0 && !isConnected) {
      setShouldRestoreConnection(true);
    }
  }, [selectedIntegrationIds]);

  // Add effect to handle connection restoration
  useEffect(() => {
    if (shouldRestoreConnection && !isConnected) {
      handleConnect();
      setShouldRestoreConnection(false);
    }
  }, [shouldRestoreConnection, isConnected]);

  // Add effect to handle disconnection
  useEffect(() => {
    if (!isConnected && shouldRestoreConnection) {
      // Don't clear messages when disconnecting if we're going to restore
      return;
    }
  }, [isConnected, shouldRestoreConnection]);

  // Add effect to handle reconnection
  useEffect(() => {
    if (isConnected && shouldRestoreConnection) {
      // Reset the flag after successful reconnection
      setShouldRestoreConnection(false);
    }
  }, [isConnected, shouldRestoreConnection]);

  // Human Input Dialog Handlers
  const handleHumanInputSubmit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (humanInputRequest && humanInputResponse.trim()) {
      // Add user's response as a message
      setMessages(prev => [
        ...prev.map(m => 
          m.humanInputRequest ? {
            ...m,
            content: `✅ Query Updated\n\nOriginal Query: ${humanInputRequest.current_query}\n\nUpdated Query: ${humanInputResponse.trim()}`,
            isTyping: false,
            humanInputRequest: undefined
          } : m
        ),
        {
          id: `user-response-${Date.now()}`,
          type: 'user',
          content: humanInputResponse.trim(),
          timestamp: new Date()
        }
      ]);
      sendHumanInputResponse(humanInputRequest.request_id, humanInputResponse.trim());
      setHumanInputResponse('');
    }
  };

  const handleHumanInputCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (humanInputRequest) {
      // Add user's cancellation as a message
      setMessages(prev => [
        ...prev.map(m => 
          m.humanInputRequest ? {
            ...m,
            content: `✅ Keeping Original Query\n\nQuery: ${humanInputRequest.current_query}`,
            isTyping: false,
            humanInputRequest: undefined
          } : m
        ),
        {
          id: `user-cancel-${Date.now()}`,
          type: 'user',
          content: 'Keep original query',
          timestamp: new Date()
        }
      ]);
      sendHumanInputResponse(humanInputRequest.request_id, '');
      setHumanInputResponse('');
    }
  };

  // Generation Confirmation Dialog Handlers
  const handleGenerationConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (generationConfirmationRequest) {
      // Add user's confirmation as a message
      setMessages(prev => [
        ...prev.map(m => 
          m.generationConfirmationRequest ? {
            ...m,
            content: `✅ Proceeding with Current Plan\n\n${generationConfirmationRequest.message}`,
            isTyping: false,
            generationConfirmationRequest: undefined
          } : m
        ),
        {
          id: `user-confirm-${Date.now()}`,
          type: 'user',
          content: 'Continue with current plan',
          timestamp: new Date()
        }
      ]);
      sendGenerationConfirmationResponse(generationConfirmationRequest.request_id, false);
    }
  };

  const handleGenerationChanges = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Add user's request for changes as a message
    setMessages(prev => [
      ...prev.map(m => 
        m.generationConfirmationRequest ? {
          ...m,
          content: `✏️ Requesting Changes\n\nCurrent Plan:\n${m.generationConfirmationRequest.message}`,
          isTyping: false,
          generationConfirmationRequest: m.generationConfirmationRequest
        } : m
      ),
      {
        id: `user-changes-${Date.now()}`,
        type: 'user',
        content: 'Request changes to the plan',
        timestamp: new Date()
      }
    ]);
    setShowChangesInput(true);
  };

  const handleSubmitChanges = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (generationConfirmationRequest && changesText.trim()) {
      // Add user's changes as a message
      setMessages(prev => [
        ...prev.map(m => 
          m.generationConfirmationRequest ? {
            ...m,
            content: `✅ Changes Submitted\n\nCurrent Plan:\n${m.generationConfirmationRequest.message}\n\nRequested Changes:\n${changesText.trim()}`,
            isTyping: false,
            generationConfirmationRequest: undefined
          } : m
        ),
        {
          id: `user-submit-changes-${Date.now()}`,
          type: 'user',
          content: `Requested changes:\n${changesText.trim()}`,
          timestamp: new Date()
        }
      ]);
      sendGenerationConfirmationResponse(generationConfirmationRequest.request_id, true, changesText.trim());
      setShowChangesInput(false);
      setChangesText('');
    }
  };

  const handleBackToConfirmation = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Add user's back action as a message
    setMessages(prev => [
      ...prev.map(m => 
        m.generationConfirmationRequest ? {
          ...m,
          content: `🔄 Back to Confirmation\n\n${m.generationConfirmationRequest.message}\n\nWould you like to make any changes before we generate your integration code?`,
          isTyping: false,
          generationConfirmationRequest: m.generationConfirmationRequest
        } : m
      ),
      {
        id: `user-back-${Date.now()}`,
        type: 'user',
        content: 'Go back to confirmation',
        timestamp: new Date()
      }
    ]);
    setShowChangesInput(false);
    setChangesText('');
  };

  // Add effect to maintain scroll position
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = scrollPosition;
    }
  }, [messages.length, scrollPosition]);

  // Modify toggleNodeDiagram to maintain scroll position
  const toggleNodeDiagram = () => {
    // Save current page scroll position
    setPageScrollPosition(window.scrollY);
    setIsNodeDiagramVisible(!isNodeDiagramVisible);
  };

  return (
    <>
      <div ref={mainContainerRef} className={`flex w-full max-w-full mx-auto bg-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${isFullScreen ? 'fixed inset-0 z-50' : 'h-[85vh]'}`}>
        {/* Workflow Node Diagram Panel (Resizable) */}
        {isNodeDiagramVisible && (
          <div
            style={{ width: `${diagramWidth}px` }}
            className="relative transition-all duration-300 ease-in-out"
          >
            <WorkflowNodeDiagram
              nodes={nodeHistory}
              activeNode={activeNodeName}
              onResize={handleMouseDownResize}
              isVisible={isNodeDiagramVisible}
            />
          </div>
        )}

        {/* Main Chat Console */}
        <div className="flex flex-col flex-1 min-w-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleNodeDiagram}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-[#001e80] transition-colors"
                title={isNodeDiagramVisible ? "Hide Workflow Progress" : "Show Workflow Progress"}
              >
                {isNodeDiagramVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </button>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="font-medium text-base text-gray-700">My Workflow {isConnected ? '(Connected)' : '(Disconnected)'}</span>
            </div>
            <div className="flex items-center gap-3">
              {!isConnected && (
                <button
                  onClick={handleConnect}
                  className="px-3 py-1.5 bg-[#001e80] text-white rounded-md text-sm hover:bg-[#001e80]/90 transition-all"
                >
                  Connect
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-all flex items-center gap-1.5"
                  title="Clear Chat"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-[#001e80] transition-colors"
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-white"
            style={{ scrollBehavior: 'auto' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <Send className="h-6 w-6 text-[#001e80]" />
                </div>
                <p className="font-medium text-lg text-gray-700 mb-2">Start a new conversation</p>
                <p className="text-sm max-w-md mt-1 text-gray-500">
                  Enter a prompt below to generate tasks for your workflow
                </p>
              </div>
            ) : (
              <div className="py-4 px-4 md:px-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                  >
                    {message.type !== 'user' && (
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <div className="w-8 h-8 rounded-full bg-[#001e80] flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[98%] ${message.type === 'user' ? 'ml-auto' : ''}`}>
                      <div
                        className={`inline-block rounded-lg px-4 py-3 ${message.type === 'user'
                            ? 'bg-[#001e80] text-white'
                            : message.type === 'processing'
                              ? 'bg-gray-100 text-gray-700'
                              : message.type === 'logs'
                                ? 'bg-gray-50 text-gray-800 border border-gray-200'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {message.type === 'processing' ? (
                          <div className="flex items-center">
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ) : message.type === 'logs' ? (
                          <div className="space-y-2">
                            <div
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded"
                              onClick={() => toggleLogsExpansion(message.id)}
                            >
                              <ChevronRight className={`h-4 w-4 transition-transform ${message.isExpanded ? 'rotate-90' : ''}`} />
                              <span>{message.content}</span>
                              {message.isTyping && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                            {message.isExpanded && (
                              <div className="space-y-1.5">
                                {message.logs?.map((log, index) => (
                                  <div key={index} className="text-xs text-gray-600 pl-6 border-l-2 border-gray-200">
                                    {log}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : message.humanInputRequest ? (
                          <div className="space-y-4">
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <div className="space-y-2">
                              <Textarea
                                value={humanInputResponse}
                                onChange={(e) => setHumanInputResponse(e.target.value)}
                                placeholder="Enter your revised query here..."
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={handleHumanInputCancel}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                                >
                                  Keep Original
                                </button>
                                <button
                                  onClick={handleHumanInputSubmit}
                                  disabled={!humanInputResponse.trim()}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-[#001e80] rounded-md hover:bg-[#001e80]/90 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#001e80] transition-colors"
                                >
                                  Submit Revision
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : message.generationConfirmationRequest ? (
                          <div className="space-y-4">
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {message.content}
                            </p>
                            {!showChangesInput ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={handleGenerationConfirm}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-[#001e80] rounded-md hover:bg-[#001e80]/90 focus:outline-none focus:ring-1 focus:ring-[#001e80] transition-colors"
                                >
                                  ✅ No - Continue
                                </button>
                                <button
                                  onClick={handleGenerationChanges}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                                >
                                  ⚙️ Yes - Make Changes
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <h4 className="font-semibold text-blue-800 mb-2">📋 Types of Changes You Can Make:</h4>
                                  <ul className="text-sm text-blue-700 space-y-1">
                                    <li><strong>➕ Addition:</strong> Add new tasks or details to existing tasks</li>
                                    <li><strong>➖ Deletion:</strong> Remove tasks or specific details from tasks</li>
                                    <li><strong>🔄 Overall Modification:</strong> Change the entire workflow approach</li>
                                  </ul>
                                </div>
                                <Textarea
                                  value={changesText}
                                  onChange={(e) => setChangesText(e.target.value)}
                                  placeholder={`Specify what you want to change. Examples:\n\n` +
                                    `➕ ADDITION:\n` +
                                    `• Add a validation step before creating tickets\n` +
                                    `• Include additional fields like priority and due date\n` +
                                    `• Add a notification to Slack after Discord posting\n\n` +
                                    `➖ DELETION:\n` +
                                    `• Remove the Discord posting step\n` +
                                    `• Don't include ticket descriptions\n` +
                                    `• Skip the title customization\n\n` +
                                    `🔄 OVERALL MODIFICATION:\n` +
                                    `• Change from creating tickets to updating existing ones\n` +
                                    `• Use email notifications instead of Discord\n` +
                                    `• Completely restructure the workflow to handle data differently`}
                                  className="min-h-[140px] resize-vertical"
                                />
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={handleSubmitChanges}
                                    disabled={!changesText.trim()}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-[#001e80] rounded-md hover:bg-[#001e80]/90 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#001e80] transition-colors"
                                  >
                                    📝 Submit Changes
                                  </button>
                                  <button
                                    onClick={handleBackToConfirmation}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                                  >
                                    ⬅️ Back
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {message.type === 'system' && message.isTyping
                                ? message.displayedContent
                                : message.content}
                              {message.type === 'system' && message.isTyping && (
                                <span className="typing-cursor inline-block w-[2px] h-4 ml-[2px] bg-[#001e80] animate-[blink_0.8s_ease-in-out_infinite]"></span>
                              )}
                            </p>

                            {/* Generated Code (for system messages only) */}
                            {message.type === 'system' && message.generatedCode && !message.isTyping && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => toggleCodeExpansion(message.id, e)}
                                    className="flex items-center gap-1.5 text-sm text-[#001e80] hover:text-[#001e80]/80 py-1"
                                  >
                                    <Code className="h-4 w-4" />
                                    <span>Generated Code</span>
                                    <ArrowRight className={`h-3 w-3 transition-transform ${expandedCode === message.id ? 'rotate-90' : ''}`} />
                                  </button>
                                </div>

                                {expandedCode === message.id && (
                                  <div className="mt-2 bg-[#1e293b] rounded-md overflow-hidden text-sm">
                                    <div className="px-3 py-2 border-b border-gray-700 text-xs font-medium text-gray-300 bg-[#0f172a] flex justify-between items-center">
                                      <div className="flex items-center">
                                        <Code className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                                        Code Output {message.isEditingCode ? '(Editing)' : ''}
                                      </div>

                                      {message.isEditingCode ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => saveEditedCode(message.id)}
                                            className="text-green-400 hover:text-green-300 p-1 rounded transition-colors flex items-center gap-1"
                                            title="Save changes"
                                          >
                                            <Check className="h-3.5 w-3.5" />
                                            <span className="text-xs">Save Changes</span>
                                          </button>
                                          <button
                                            onClick={() => toggleCodeEditing(message.id, false)}
                                            className="text-gray-400 hover:text-gray-300 p-1 rounded transition-colors flex items-center gap-1"
                                            title="Cancel editing"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                            <span className="text-xs">Cancel</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex gap-2">
                                          {onSaveWorkflow && (
                                            <button
                                              onClick={handleSaveLatestCode}
                                              className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors flex items-center gap-1"
                                              title="Save workflow to project"
                                            >
                                              <Check className="h-3.5 w-3.5" />
                                              <span className="text-xs">Save Workflow</span>
                                            </button>
                                          )}
                                          <button
                                            onClick={() => toggleCodeEditing(message.id, true)}
                                            className="text-gray-400 hover:text-gray-300 p-1 rounded transition-colors"
                                            title="Edit code"
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <div 
                                      className="relative bg-[#1e293b]"
                                      style={{ 
                                        height: '400px',
                                        width: message.codeWidth || '100%'
                                      }}
                                    >
                                      <div className="absolute inset-0 p-3">
                                        {message.isEditingCode ? (
                                          <textarea
                                            value={message.editedCode}
                                            onChange={(e) => handleCodeChange(message.id, e.target.value)}
                                            className="w-full h-full bg-[#1e1e3f] text-gray-300 font-mono text-xs p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded resize-none"
                                            spellCheck="false"
                                          />
                                        ) : (
                                          <pre className="w-full h-full text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto bg-[#1e1e3f] p-2 rounded">
                                            {message.generatedCode}
                                          </pre>
                                        )}
                                      </div>
                                      {/* Horizontal resize handle */}
                                      <div 
                                        className="absolute top-0 right-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          const startX = e.clientX;
                                          const container = e.currentTarget.parentElement;
                                          if (!container) return;
                                          
                                          const startWidth = container.offsetWidth;
                                          const minWidth = 300;
                                          
                                          const handleMouseMove = (e: MouseEvent) => {
                                            const deltaX = e.clientX - startX;
                                            const newWidth = Math.max(minWidth, startWidth + deltaX);
                                            setMessages(prev => prev.map(m => 
                                              m.id === message.id ? { ...m, codeWidth: `${newWidth}px` } : m
                                            ));
                                          };
                                          
                                          const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                          };
                                          
                                          document.addEventListener('mousemove', handleMouseMove);
                                          document.addEventListener('mouseup', handleMouseUp);
                                        }}
                                      >
                                        <div className="h-8 w-1 bg-gray-600 rounded-full group-hover:bg-blue-500 transition-colors" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0 ml-3 mt-1">
                        <div className="w-8 h-8 rounded-full bg-black/90 flex items-center justify-center">
                          {getUserInitials() ? (
                            <span className="text-sm font-semibold text-white">
                              {getUserInitials()}
                            </span>
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {(error || connectError) && (
            <div className="mx-4 md:mx-8 my-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {connectError || error}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <form onSubmit={handleSubmit} className="relative flex items-end">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your workflow description..."
                disabled={!isConnected || isProcessing}
                className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#001e80] focus:border-[#001e80] transition-all text-sm shadow-sm bg-white min-h-[50px]"
              />
              <button
                type="submit"
                disabled={!isConnected || !prompt.trim() || isProcessing}
                className="absolute right-3 bottom-[13px] p-1.5 rounded-md bg-[#001e80] text-white disabled:bg-gray-300 hover:bg-[#001e80]/90 transition-all flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">{isProcessing ? 'Processing...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// Add global animation styles for the typing cursor
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes blink {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1; /* scrollbar color */
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8; /* scrollbar hover color */
    }
  `;
  document.head.appendChild(style);
} 
