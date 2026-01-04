'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Search, Check, X, ChevronRight, Loader2, User, Bot, Settings2 } from 'lucide-react';
import Image from 'next/image';
import Logo from '@/assets/logosaas.png';
import { mcpIntegrationService, McpIntegration } from '@/services/mcpIntegrationService';
import { Button } from '@/components/screens/ui/button';
import { Input } from '@/components/screens/ui/input';
import { Badge } from '@/components/screens/ui/badge';
import { ScrollArea } from '@/components/screens/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

// Custom Tooltip component
const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode }> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Hide tooltip if it overflows right
  useEffect(() => {
    if (visible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        tooltipRef.current.style.left = `-${rect.width - 32}px`;
      } else {
        tooltipRef.current.style.left = '';
      }
    }
  }, [visible]);

  return (
    <span className="relative inline-block align-middle">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        className="ml-2 text-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full flex items-center transition-colors duration-150 hover:text-blue-500"
        aria-label="Show usage info"
        style={{ verticalAlign: 'middle' }}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          className="z-50 absolute left-1/2 top-full mt-2 max-w-xs sm:max-w-md lg:max-w-lg w-[90vw] sm:w-[340px] bg-white border border-gray-200 shadow-xl rounded-lg p-4 text-xs text-gray-800 whitespace-pre-wrap font-mono break-all overflow-hidden text-ellipsis overflow-y-auto"
          style={{ transform: 'translateX(-50%)', maxHeight: '16rem', wordBreak: 'break-all', overflowWrap: 'break-word' }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </span>
  );
};

function prettyPrintJson(jsonString: string) {
  try {
    const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    return JSON.stringify(obj, null, 2);
  } catch {
    return jsonString;
  }
}

// Define a palette of gradients for agent nodes
const agentGradients = [
  'from-pink-100 to-pink-300 border-pink-300',
  'from-green-100 to-green-300 border-green-300',
  'from-yellow-100 to-yellow-300 border-yellow-300',
  'from-purple-100 to-purple-300 border-purple-300',
  'from-orange-100 to-orange-300 border-orange-300',
  'from-cyan-100 to-cyan-300 border-cyan-300',
  'from-indigo-100 to-indigo-300 border-indigo-300',
  'from-teal-100 to-teal-300 border-teal-300',
];

export default function WorkflowMcpPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<McpIntegration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<McpIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [mainPrompt, setMainPrompt] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Add refs for env var boxes
  const envBoxRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const handleAgentClick = useCallback((integrationId: string) => {
    const ref = envBoxRefs.current[integrationId];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(integrationId);
      setTimeout(() => setHighlightedId(null), 1200);
    }
  }, []);

  // Load integrations (paginated)
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true);
      try {
        let data;
        if (searchQuery.trim()) {
          data = await mcpIntegrationService.searchIntegrations(searchQuery, offset, limit);
        } else {
          data = await mcpIntegrationService.getIntegrations(offset, limit);
        }
        setIntegrations(Array.isArray(data.mcpServers) ? data.mcpServers : []);
        setTotal(data.total || 0);
      } catch (error) {
        setIntegrations([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };
    loadIntegrations();
  }, [searchQuery, offset, limit]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOffset(0);
  };

  // Handle integration selection
  const toggleIntegration = (integration: McpIntegration) => {
    const isSelected = selectedIntegrations.some(i => i.id === integration.id);
    let newSelectedIntegrations: McpIntegration[];
    if (isSelected) {
      newSelectedIntegrations = selectedIntegrations.filter(i => i.id !== integration.id);
    } else {
      newSelectedIntegrations = [...selectedIntegrations, integration];
    }
    setSelectedIntegrations(newSelectedIntegrations);
  };

  // Pagination
  const handlePrev = () => {
    setOffset(Math.max(0, offset - limit));
  };
  const handleNext = () => {
    if (offset + limit < total) setOffset(offset + limit);
  };

  // Handle env var change
  const handleEnvVarChange = (envName: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [envName]: value }));
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const mcp_server_ids = selectedIntegrations.map((i) => i.id);
      const workflow_id = nanoid(); // random id
      const body = {
        mcp_server_ids,
        workflow_id,
        main_prompt: mainPrompt,
        env_vars: envVars,
      };
      const res = await fetch((process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:40001/execute-mcp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to execute workflow');
      const data = await res.json();
      // Navigate to /workflow-mcp/execute with all relevant details
      router.push(`/workflow-mcp/execute?session_id=${encodeURIComponent(data.session_id)}&workflow_id=${encodeURIComponent(workflow_id)}&main_prompt=${encodeURIComponent(mainPrompt)}&env_vars=${encodeURIComponent(JSON.stringify(envVars))}&mcp_server_ids=${encodeURIComponent(JSON.stringify(mcp_server_ids))}&agent_names=${encodeURIComponent(JSON.stringify(selectedIntegrations.map(i => i.displayName)))}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#D2DCFF]">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-sm bg-white/50 border-b-2 border-gray-200 z-20 transition-all duration-300">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-4 text-[#001e80] hover:text-[#001a70] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <Image
                src={Logo || "/placeholder.svg"}
                alt="Saas Logo"
                height={36}
                width={36}
                className="cursor-pointer"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Two Panel Layout */}
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Integrations List */}
          <div className="md:w-1/3 w-full md:sticky md:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search integrations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2 p-6">
                  {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : integrations.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No MCP integrations found</div>
                  ) : (
                    integrations.map(integration => {
                      const isSelected = selectedIntegrations.some(i => i.id === integration.id);
                      return (
                        <button
                          key={integration.id}
                          onClick={() => toggleIntegration(integration)}
                          className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${isSelected
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                          <div>
                            <h4 className="font-medium">{integration.displayName}</h4>
                            <p className="text-sm text-gray-500">{integration.name}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{integration.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center p-4 border-t border-gray-100">
                <Button variant="outline" onClick={handlePrev} disabled={offset === 0}>
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
                </span>
                <Button variant="outline" onClick={handleNext} disabled={offset + limit >= total}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Workflow Creation Form */}
          <div className="md:w-2/3 w-full">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              {/* Orchestrator/Agent Flow Visualization (now above main prompt) */}
              {selectedIntegrations.length > 0 && (
                <div className="flex flex-col items-center mb-10">
                  {/* Orchestrator Node */}
                  <div className="relative flex flex-col items-center mb-6">
                    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-blue-50 to-gray-100 border-2 border-blue-300 rounded-2xl shadow-lg min-w-[220px] max-w-[340px]">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 border border-blue-400 mr-2">
                        <Settings2 className="w-6 h-6 text-blue-700" />
                      </span>
                      <span className="font-bold text-lg text-blue-900">Orchestrator</span>
                    </div>
                    {/* SVG lines from orchestrator to each agent */}
                    <svg
                      width="100%"
                      height={selectedIntegrations.length > 1 ? 40 : 24}
                      className="absolute left-0 right-0 mx-auto pointer-events-none"
                      style={{ top: '100%', zIndex: 0 }}
                    >
                      {selectedIntegrations.map((_, idx) => {
                        const total = selectedIntegrations.length;
                        const spacing = 220 / (total + 1);
                        const x = spacing * (idx + 1);
                        return (
                          <line
                            key={idx}
                            x1={110}
                            y1={0}
                            x2={x}
                            y2={40}
                            stroke="#cbd5e1"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  {/* Agent Nodes */}
                  <div className="flex items-center justify-center w-full">
                    {selectedIntegrations.map((integration, idx) => (
                      <React.Fragment key={integration.id}>
                        <div
                          className={`flex items-center gap-2 px-4 py-2 bg-white border ${agentGradients[idx % agentGradients.length]} rounded-xl shadow-sm transition-all hover:shadow-lg cursor-pointer min-w-[120px] max-w-[180px] mx-1 relative z-10`}
                          title={integration.displayName}
                          tabIndex={0}
                          onClick={() => handleAgentClick(integration.id)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleAgentClick(integration.id); }}
                          role="button"
                          aria-label={`Configure ${integration.displayName}`}
                        >
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${agentGradients[idx % agentGradients.length]} border mr-2`}>
                            <Bot className="w-5 h-5 text-gray-600" />
                          </span>
                          <span className="font-medium text-gray-800 truncate text-base" style={{ maxWidth: 90 }}>
                            {integration.displayName.length > 14 ? integration.displayName.slice(0, 14) + '…' : integration.displayName}
                          </span>
                        </div>
                        {idx < selectedIntegrations.length - 1 && (
                          <div className="flex-1 min-w-[32px] h-0.5 mx-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" style={{ maxWidth: 48 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              {/* Main Prompt (now below diagram) */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Main Prompt</label>
                <textarea
                  className="w-full min-h-[100px] border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base bg-gray-50"
                  placeholder="Describe what you want to do..."
                  value={mainPrompt}
                  onChange={e => setMainPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-8">
                {selectedIntegrations.length === 0 ? (
                  <div className="text-gray-400 text-center py-8 border-2 border-dashed rounded-lg">Select integrations from the left to configure them here.</div>
                ) : (
                  selectedIntegrations.map(integration => (
                    <div
                      key={integration.id}
                      ref={el => { envBoxRefs.current[integration.id] = el; }}
                      className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-all hover:shadow-lg relative ${highlightedId === integration.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-semibold text-[#001e80] text-base flex items-center">
                          {integration.displayName}
                          <Tooltip content={<pre>{prettyPrintJson(integration.usage)}</pre>}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1 align-middle transition-transform duration-150 hover:scale-110"><circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#888">i</text></svg>
                          </Tooltip>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {integration.env.map(envName => (
                          <div key={envName}>
                            <label className="block text-xs font-medium mb-1 text-gray-700">{envName}</label>
                            <Input
                              type="text"
                              placeholder={`Enter value for ${envName}`}
                              value={envVars[envName] || ''}
                              onChange={e => handleEnvVarChange(envName, e.target.value)}
                              className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {submitError && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{submitError}</div>
              )}
              <div className="flex items-center gap-4 mt-10">
                <Button
                  className="bg-[#001e80] hover:bg-[#001a70] text-white px-8 py-2 rounded-lg text-base shadow-md"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !mainPrompt || selectedIntegrations.some(integration => integration.env.some(envName => !envVars[envName]))}
                >
                  {isSubmitting ? 'Submitting...' : 'Execute Workflow'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-6 text-center mt-auto">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Image src={Logo || "/placeholder.svg"} height={30} width={30} alt="SaaS logo" className="relative" />
          </div>
          <p className="mt-4">&copy; 2024 Flomny.com, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
