"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/screens/ui/button";
import { Input } from "@/components/screens/ui/input";
import { Loader2, Bot, Settings2 } from "lucide-react";

export default function WorkflowMcpExecutePage() {
    const searchParams = useSearchParams();
    const session_id = searchParams.get("session_id") || "";
    const workflow_id = searchParams.get("workflow_id") || "";
    const main_prompt = searchParams.get("main_prompt") || "";
    const env_vars = searchParams.get("env_vars") ? JSON.parse(searchParams.get("env_vars")!) : {};
    const mcp_server_ids = searchParams.get("mcp_server_ids") ? JSON.parse(searchParams.get("mcp_server_ids")!) : [];
    const agent_names = searchParams.get("agent_names") ? JSON.parse(searchParams.get("agent_names")!) : [];

    const [ws, setWs] = useState<WebSocket | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);
    const [success, setSuccess] = useState(false);
    const [humanInputRequested, setHumanInputRequested] = useState(false);

    // Connect to websocket
    useEffect(() => {
        if (!session_id) return;
        const socket = new WebSocket(`${process.env.NEXT_PUBLIC_MCP_WS_URL || 'ws://localhost:40001/ws'}/${session_id}`);
        setWs(socket);
        setError(null);

        socket.onopen = () => {
            setIsConnected(true);
            setLogs((prev) => [...prev, "[Connected to orchestrator]"]);
        };
        socket.onmessage = (event) => {
            setLogs((prev) => [...prev, event.data]);
            if (/^\s*Finished\s*\|.+\/ Elapsed Time/.test(event.data)) {
                setSuccess(true);
            }
            if (event.data.includes('[HUMAN INPUT REQUESTED]')) {
                setHumanInputRequested(true);
            }
        };
        socket.onerror = (e) => {
            setError("WebSocket error");
            setIsConnected(false);
        };
        socket.onclose = () => {
            setIsConnected(false);
            setLogs((prev) => [...prev, "[Disconnected]"]);
        };
        return () => {
            socket.close();
        };
    }, [session_id]);

    // Scroll to bottom on new log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Send message
    const handleSend = () => {
        if (ws && isConnected && input.trim() && humanInputRequested) {
            ws.send(input);
            setLogs((prev) => [...prev, `[You]: ${input}`]);
            setInput("");
            setHumanInputRequested(false);
        }
    };

    // Add orchestrator/agent diagram gradients
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

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#D2DCFF]">
            <header className="sticky top-0 bg-white/80 border-b-2 border-gray-200 z-20">
                <div className="container py-4 flex items-center gap-4">
                    <span className="text-lg font-bold text-[#001e80]">Workflow Execution Console</span>
                </div>
            </header>
            <main className="flex-1 container py-8 flex flex-col gap-8">
                {/* Orchestrator/Agent Diagram */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-100">
                    <div className="flex flex-col items-center mb-4">
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
                                height={mcp_server_ids.length > 1 ? 40 : 24}
                                className="absolute left-0 right-0 mx-auto pointer-events-none"
                                style={{ top: '100%', zIndex: 0 }}
                            >
                                {mcp_server_ids.map((_: string, idx: number) => {
                                    const total = mcp_server_ids.length;
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
                            {mcp_server_ids.map((id: string, idx: number) => {
                                const displayName = Array.isArray(agent_names) && agent_names[idx] ? agent_names[idx] : id;
                                return (
                                    <React.Fragment key={id}>
                                        <div
                                            className={`flex items-center gap-2 px-4 py-2 bg-white border ${agentGradients[idx % agentGradients.length]} rounded-xl shadow-sm transition-all hover:shadow-lg cursor-pointer min-w-[120px] max-w-[180px] mx-1 relative z-10`}
                                            title={displayName}
                                        >
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${agentGradients[idx % agentGradients.length]} border mr-2`}>
                                                <Bot className="w-5 h-5 text-gray-600" />
                                            </span>
                                            <span className="font-medium text-gray-800 truncate text-base" style={{ maxWidth: 90 }}>
                                                {typeof displayName === 'string' && displayName.length > 14 ? displayName.slice(0, 14) + '…' : displayName}
                                            </span>
                                        </div>
                                        {idx < mcp_server_ids.length - 1 && (
                                            <div className="flex-1 min-w-[32px] h-0.5 mx-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" style={{ maxWidth: 48 }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="font-semibold text-gray-700 mb-1">Main Prompt</div>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800 whitespace-pre-line">{main_prompt}</div>
                    </div>
                </div>
                {/* Success Banner */}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 font-semibold text-center">
                        Workflow finished successfully!
                    </div>
                )}
                {/* Log Console */}
                <div className="flex-1 flex flex-col bg-black rounded-xl shadow-lg border border-gray-900/10 p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/80">
                        <span className="text-xs text-gray-200">Live Logs</span>
                        <span className={`text-xs font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-auto px-6 py-4 custom-scrollbar max-h-[60vh] min-h-[200px] bg-gray-950 border border-gray-800 rounded-b-xl">
                        {logs.length === 0 ? (
                            <div className="text-gray-400 text-sm">No logs yet...</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className="text-xs text-gray-100 whitespace-pre font-mono mb-1">{log}</div>
                            ))
                        )}
                        <div ref={logEndRef} />
                    </div>
                    <div className="flex items-center gap-2 border-t border-gray-800 bg-gray-900/80 px-6 py-3">
                        <Input
                            className="flex-1 bg-gray-950 text-gray-100 border-none focus:ring-2 focus:ring-blue-400 rounded"
                            placeholder="Type a message and press Enter..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                            disabled={!isConnected || !humanInputRequested}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!isConnected || !input.trim() || !humanInputRequested}
                            className="bg-[#001e80] hover:bg-[#001a70] text-white px-6"
                        >
                            {isConnected ? 'Send' : <Loader2 className="animate-spin h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
} 