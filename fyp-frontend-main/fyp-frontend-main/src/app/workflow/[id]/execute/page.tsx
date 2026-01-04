"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { workflowService } from '@/services/workflowService';
import nookies from 'nookies';
import { Code, SlidersHorizontal, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/screens/ui/dialog';
import { Button } from '@/components/screens/ui/button';

// Regex to match <<<.INTEGRATION:PLACEHOLDER>>>
const PLACEHOLDER_REGEX = /<<<\.([A-Za-z0-9_ ]+):([A-Za-z0-9_ ]+)>>>/g;

export default function ExecuteWorkflowPage() {
    const params = useParams();
    const workflowId = params.id;
    const router = useRouter();
    const [workflow, setWorkflow] = useState<{ name: string; description: string } | null>(null);
    const [workflowCode, setWorkflowCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [placeholderValues, setPlaceholderValues] = useState<{ [key: string]: string }>({});
    const [logs, setLogs] = useState<{ type: string; data: string }[]>([]);
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ type: string; data: string } | null>(null);
    const logAreaRef = useRef<HTMLDivElement>(null);
    const outputContainerRef = useRef<HTMLDivElement>(null);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
    const [showEmptyParamsDialog, setShowEmptyParamsDialog] = useState(false);
    const [pendingExecute, setPendingExecute] = useState<null | (() => void)>(null);
    const [emptyParams, setEmptyParams] = useState<string[]>([]);
    const [groupedLogs, setGroupedLogs] = useState<{
        log: string[];
        success: string[];
        error: string[];
        timeout: string[];
        malformed: string[];
        exception: string[];
    } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchWorkflowAndCode = async () => {
            try {
                const wf = await workflowService.getWorkflowById(workflowId as string);
                if (!wf) {
                    setError('Workflow not found');
                    return;
                }
                setWorkflow({ name: wf.name, description: wf.description });
                const cookies = nookies.get(null);
                const token = cookies.accessToken;
                const response = await fetch(wf.workflowURL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch workflow code');
                }
                const code = await response.text();
                setWorkflowCode(code);
                // Extract placeholders
                const found = Array.from(code.matchAll(PLACEHOLDER_REGEX)).map(match => match[0]);
                // Remove duplicates
                const unique = Array.from(new Set(found));
                setPlaceholders(unique);
                // Initialize values if not already set
                setPlaceholderValues(prev => {
                    const newVals = { ...prev };
                    unique.forEach(ph => {
                        if (!(ph in newVals)) newVals[ph] = '';
                    });
                    return newVals;
                });
            } catch (err) {
                setError('Failed to load workflow or code');
                console.error('Error fetching workflow/code:', err);
            } finally {
                setCodeLoading(false);
            }
        };
        if (workflowId) fetchWorkflowAndCode();
    }, [workflowId]);

    const handleInputChange = (ph: string, value: string) => {
        setPlaceholderValues(prev => ({ ...prev, [ph]: value }));
    };

    // Function to replace placeholders with user input (or leave placeholder if empty)
    // and highlight replaced/unfilled values
    const getHighlightedPreview = () => {
        if (!workflowCode) return '';
        // Split code into lines for easier rendering
        const lines = workflowCode.split('\n');
        return lines.map((line, idx) => {
            // Replace all placeholders in the line
            let result = [];
            let lastIndex = 0;
            let match;
            PLACEHOLDER_REGEX.lastIndex = 0; // Reset regex state
            while ((match = PLACEHOLDER_REGEX.exec(line)) !== null) {
                const [ph] = match;
                const value = placeholderValues[ph];
                // Push text before the match
                if (match.index > lastIndex) {
                    result.push(line.slice(lastIndex, match.index));
                }
                // Highlight
                if (value && value.trim() !== '') {
                    result.push(
                        <span key={ph + idx} className="bg-emerald-100 text-emerald-800 rounded px-1 font-semibold transition-colors duration-200">
                            {value}
                        </span>
                    );
                } else {
                    result.push(
                        <span key={ph + idx} className="bg-yellow-100 text-yellow-800 rounded px-1 font-semibold animate-pulse transition-colors duration-200">
                            {ph}
                        </span>
                    );
                }
                lastIndex = match.index + ph.length;
            }
            // Push the rest of the line
            if (lastIndex < line.length) {
                result.push(line.slice(lastIndex));
            }
            // Return as a fragment with line break
            return <div key={idx}>{result}</div>;
        });
    };

    const handleExecute = async () => {
        if (!workflowCode) return;
        // Find empty parameters
        const empty = placeholders.filter(ph => !placeholderValues[ph] || placeholderValues[ph].trim() === '');
        if (empty.length > 0) {
            setEmptyParams(empty);
            setShowEmptyParamsDialog(true);
            setPendingExecute(() => () => actuallyExecute(true));
            return;
        }
        // Scroll to output area before starting execution
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        actuallyExecute(false);
    };

    const actuallyExecute = async (allowEmpty: boolean) => {
        // Scroll to output area when execution starts (after confirmation)
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        setShowEmptyParamsDialog(false);
        setPendingExecute(null);
        setLogs([]);
        setGroupedLogs(null);
        setExecutionResult(null);
        setExecuting(true);
        setConnectionStatus('connecting');
        try {
            // Prepare request body
            const body = {
                code: workflowCode, // original code with placeholders
                parameters: Object.fromEntries(
                    placeholders.map(ph => [ph, placeholderValues[ph] || ''])
                )
            };
            // Use fetch with ReadableStream for SSE (POST)
            const response = await fetch(process.env.NEXT_PUBLIC_EXECUTE_API_URL || 'http://localhost:50010/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.body) throw new Error('No response body');
            setConnectionStatus('connected');
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let tempLogs: { type: string; data: string }[] = [];
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let events = buffer.split('\n\n'); // SSE events are separated by double newline
                buffer = events.pop() || '';
                for (const eventBlock of events) {
                    if (!eventBlock.trim()) continue;
                    // Try JSON parse first (for backward compatibility)
                    let parsed = false;
                    try {
                        const evt = JSON.parse(eventBlock);
                        if (evt.event === 'log') {
                            tempLogs.push({ type: 'log', data: evt.data });
                            setLogs(prev => [...prev, { type: 'log', data: evt.data }]);
                        } else if (evt.event === 'success') {
                            setExecutionResult({ type: 'success', data: evt.data });
                            tempLogs.push({ type: 'success', data: evt.data });
                            setLogs(prev => [...prev, { type: 'success', data: evt.data }]);
                        } else if (evt.event === 'error') {
                            setExecutionResult({ type: 'error', data: evt.data });
                            tempLogs.push({ type: 'error', data: evt.data });
                            setLogs(prev => [...prev, { type: 'error', data: evt.data }]);
                        } else if (evt.event === 'timeout') {
                            setExecutionResult({ type: 'timeout', data: evt.data });
                            tempLogs.push({ type: 'timeout', data: evt.data });
                            setLogs(prev => [...prev, { type: 'timeout', data: evt.data }]);
                        }
                        parsed = true;
                    } catch { }
                    if (parsed) continue;
                    // Parse classic SSE format
                    const lines = eventBlock.split('\n');
                    let eventType = 'log';
                    let data = '';
                    for (const line of lines) {
                        if (line.startsWith('event:')) eventType = line.replace('event:', '').trim();
                        if (line.startsWith('data:')) data += line.replace('data:', '').trim();
                    }
                    if (eventType === 'success') setExecutionResult({ type: 'success', data });
                    if (eventType === 'error') setExecutionResult({ type: 'error', data });
                    if (eventType === 'timeout') setExecutionResult({ type: 'timeout', data });
                    tempLogs.push({ type: eventType, data });
                    setLogs(prev => [...prev, { type: eventType, data }]);
                }
            }
            setConnectionStatus('disconnected');
            // After execution finishes, group logs for display
            if (tempLogs.length > 0) {
                const grouped = {
                    log: [] as string[],
                    success: [] as string[],
                    error: [] as string[],
                    timeout: [] as string[],
                    malformed: [] as string[],
                    exception: [] as string[],
                };
                for (const log of tempLogs) {
                    if (log.type === 'log') grouped.log.push(log.data);
                    else if (log.type === 'success') grouped.success.push(log.data);
                    else if (log.type === 'error') grouped.error.push(log.data);
                    else if (log.type === 'timeout') grouped.timeout.push(log.data);
                    else if (log.type === 'malformed') grouped.malformed.push(log.data);
                    else if (log.type === 'exception') grouped.exception.push(log.data);
                }
                setGroupedLogs(grouped);
            }
        } catch (err: any) {
            setLogs(prev => [...prev, { type: 'exception', data: err.message || String(err) }]);
            setConnectionStatus('disconnected');
        } finally {
            setExecuting(false);
        }
    };

    // Helper to try to pretty-print JSON or Python dict-like strings
    function tryFormatLogData(data: string) {
        // Try JSON
        try {
            return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="break-words max-w-full">{JSON.stringify(JSON.parse(data), null, 2)}</pre>;
        } catch { }
        // Try Python dict-like string (single quotes)
        try {
            const jsonStr = data.replace(/'/g, '"');
            return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="break-words max-w-full">{JSON.stringify(JSON.parse(jsonStr), null, 2)}</pre>;
        } catch { }
        // Fallback
        return <span style={{ wordBreak: 'break-word' }} className="break-words max-w-full">{data}</span>;
    }

    return (
        <div className="container py-10">
            <div className="flex items-center mb-4">
                <button
                    onClick={() => router.push(`/workflow/${workflowId}`)}
                    className="flex items-center gap-2 text-[#001e80] hover:underline font-semibold text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Workflow
                </button>
            </div>
            {workflow && (
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold mb-1 text-[#001e80] tracking-tight">{workflow.name}</h1>
                    <p className="text-gray-500 mb-2">{workflow.description}</p>
                </div>
            )}
            <h1 className="text-3xl font-extrabold mb-2 text-[#001e80] tracking-tight">Execute Workflow</h1>
            <p className="mb-8 text-gray-500">Workflow ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[#001e80]">{workflowId}</span></p>
            {error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow mb-4 font-semibold">{error}</div>
            ) : codeLoading ? (
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-xl shadow mb-4 animate-pulse">Loading code...</div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                    {/* Left: Parameter Inputs */}
                    <div className="md:w-1/3 w-full bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-4 md:mb-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <SlidersHorizontal className="h-5 w-5 text-[#001e80]" />
                            <h2 className="text-lg font-bold text-[#001e80]">Parameters</h2>
                        </div>
                        {placeholders.length > 0 ? (
                            <form className="space-y-6 flex-1" onSubmit={e => { e.preventDefault(); handleExecute(); }}>
                                {placeholders.map(ph => (
                                    <div key={ph} className="flex flex-col">
                                        <label className="font-mono text-xs mb-1 text-gray-700 font-semibold flex items-center gap-1">
                                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
                                            {ph}
                                        </label>
                                        <input
                                            type="text"
                                            className="border-2 border-gray-200 focus:border-[#001e80] rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none transition-all duration-200"
                                            value={placeholderValues[ph] || ''}
                                            onChange={e => handleInputChange(ph, e.target.value)}
                                            placeholder={`Enter value for ${ph}`}
                                        />
                                    </div>
                                ))}
                                <button type="submit" className="mt-6 w-full bg-emerald-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-emerald-600 transition-colors duration-200">Execute</button>
                            </form>
                        ) : (
                            <div className="text-gray-400 italic">No parameters found in code.</div>
                        )}
                    </div>
                    {/* Right: Code Preview */}
                    <div className="md:w-2/3 w-full bg-gradient-to-br from-[#f8fafc] to-[#e9eeff] rounded-2xl p-8 shadow-xl border border-gray-100 overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4 justify-between">
                            <span className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-[#001e80]" />
                                <h2 className="text-lg font-bold text-[#001e80]">Workflow Code (Live Preview)</h2>
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(workflowCode);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1200);
                                }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors duration-200 ${copied ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                title="Copy code"
                            >
                                <Copy className="h-4 w-4" />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap shadow-inner border border-gray-800">
                            {getHighlightedPreview()}
                        </pre>
                    </div>
                </div>
            )}
            {/* TODO: Add code execution UI here */}
            <div
                ref={outputContainerRef}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mt-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#001e80]">Execution Output</h3>
                    <span
                        className={
                            connectionStatus === 'connected' ? 'inline-block w-3 h-3 rounded-full bg-emerald-500' :
                                connectionStatus === 'connecting' ? 'inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse' :
                                    'inline-block w-3 h-3 rounded-full bg-red-500'
                        }
                        title={
                            connectionStatus === 'connected' ? 'Connected' :
                                connectionStatus === 'connecting' ? 'Connecting...' :
                                    'Disconnected'
                        }
                    />
                    <span className="text-xs text-gray-500">
                        {connectionStatus === 'connected' && 'Connected'}
                        {connectionStatus === 'connecting' && 'Connecting...'}
                        {connectionStatus === 'disconnected' && 'Disconnected'}
                        {connectionStatus === 'idle' && ''}
                    </span>
                </div>
                <div
                    ref={logAreaRef}
                    className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-y-auto text-sm font-mono whitespace-pre-wrap break-words max-w-full shadow-inner border border-gray-800 mb-2"
                    style={{ minHeight: 120, maxHeight: 300 }}
                >
                    {groupedLogs ? (
                        <>
                            {groupedLogs.log.length > 0 && (
                                <div className="text-blue-300">
                                    <span className="font-bold">[LOG]</span>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline' }} className="break-words max-w-full ml-2">
                                        {groupedLogs.log.map((data, i) => (
                                            <span key={i}>{tryFormatLogData(data)}{i !== groupedLogs.log.length - 1 ? '\n' : ''}</span>
                                        ))}
                                    </pre>
                                </div>
                            )}
                            {groupedLogs.success.map((data, i) => (
                                <div key={'success-' + i} className="text-emerald-300"><span className="font-bold">[SUCCESS]</span> {tryFormatLogData(data)}</div>
                            ))}
                            {groupedLogs.error.map((data, i) => (
                                <div key={'error-' + i} className="text-red-300"><span className="font-bold">[ERROR]</span> {tryFormatLogData(data)}</div>
                            ))}
                            {groupedLogs.timeout.map((data, i) => (
                                <div key={'timeout-' + i} className="text-yellow-300"><span className="font-bold">[TIMEOUT]</span> {tryFormatLogData(data)}</div>
                            ))}
                            {groupedLogs.malformed.map((data, i) => (
                                <div key={'malformed-' + i} className="text-orange-300"><span className="font-bold">[Malformed event]</span> {tryFormatLogData(data)}</div>
                            ))}
                            {groupedLogs.exception.map((data, i) => (
                                <div key={'exception-' + i} className="text-orange-300"><span className="font-bold">[Exception]</span> {tryFormatLogData(data)}</div>
                            ))}
                        </>
                    ) : logs.length === 0 ? (
                        <span className="text-gray-500">No output yet.</span>
                    ) : (
                        logs.map((log, i) => {
                            let prefix = '';
                            let color = '';
                            if (log.type === 'log') { prefix = '[LOG] '; color = 'text-blue-300'; }
                            else if (log.type === 'success') { prefix = '[SUCCESS] '; color = 'text-emerald-300'; }
                            else if (log.type === 'error') { prefix = '[ERROR] '; color = 'text-red-300'; }
                            else if (log.type === 'timeout') { prefix = '[TIMEOUT] '; color = 'text-yellow-300'; }
                            else if (log.type === 'malformed') { prefix = '[Malformed event] '; color = 'text-orange-300'; }
                            return (
                                <div key={i} className={color}>
                                    <span className="font-bold">{prefix}</span>
                                    {tryFormatLogData(log.data)}
                                </div>
                            );
                        })
                    )}
                </div>
                {executionResult && (
                    <div className={`mt-2 p-3 rounded-lg font-semibold ${executionResult.type === 'success' ? 'bg-emerald-100 text-emerald-800' : executionResult.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {executionResult.type.toUpperCase()}: {executionResult.data}
                    </div>
                )}
            </div>
            <Dialog open={showEmptyParamsDialog} onOpenChange={setShowEmptyParamsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Some parameters are empty</DialogTitle>
                        <DialogDescription>
                            The following parameters are empty. Do you still wish to proceed? Empty values will be sent as blank strings.
                        </DialogDescription>
                        <ul className="list-disc pl-6 mt-2 text-gray-700">
                            {emptyParams.map(ph => <li key={ph}><span className="font-mono bg-yellow-100 px-1 rounded text-yellow-800">{ph}</span></li>)}
                        </ul>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowEmptyParamsDialog(false); setPendingExecute(null); }}>Cancel</Button>
                        <Button onClick={() => { setShowEmptyParamsDialog(false); if (pendingExecute) pendingExecute(); }}>Proceed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 