
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Send, Sparkles, Plus, Trash2, Menu, MessageSquare, 
    ChevronDown, Check, Info, Bot, User as UserIcon, ListTodo, Loader2, Key, Settings, X, ExternalLink,
    Server, Cpu
} from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ClassName, ExplorerNode, InstanceProperties } from '../types';
import ReactMarkdown from 'react-markdown';

// Define local interface for AIStudio
interface AIStudioClient {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

// --- TYPES ---

type ApiProvider = 'google' | 'openai' | 'anthropic';

interface ChatInterfaceProps {
  onAgentCreate: (className: ClassName, name: string, content?: string, parentId?: string) => void;
  onAgentDelete: (id: string) => void;
  onAgentReparent: (id: string, newParentId: string) => void;
  onAgentUpdate: (id: string, updates: Partial<InstanceProperties>) => void;
  onRestoreTree: (snapshot: ExplorerNode[]) => void;
  onResetTree: () => void;
  treeData: ExplorerNode[];
  treeContext: string;
  getFreshContext: () => string;
}

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    checklist?: ChecklistItem[];
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    treeSnapshot: ExplorerNode[];
}

interface ProviderSettings {
    apiKey: string;
    modelId: string;
    baseUrl: string;
}

// --- CONSTANTS ---

const DEFAULT_MODELS = {
    google: 'gemini-2.5-flash',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20240620'
};

const STANDARD_MODELS = [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'High Speed, Low Cost' },
    { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', desc: 'High Reasoning, Low Rate' },
];

const DEFAULT_BASE_URLS = {
    google: '',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1'
};

// --- STYLING COMPONENTS ---

const MarkdownComponents = {
    p: ({children}: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    strong: ({children}: any) => <span className="font-bold text-blue-200">{children}</span>,
    em: ({children}: any) => <span className="italic text-gray-400">{children}</span>,
    ul: ({children}: any) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
    ol: ({children}: any) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
    li: ({children}: any) => <li>{children}</li>,
    code: ({children}: any) => <code className="bg-[#3e3e42] px-1 py-0.5 rounded text-xs font-mono text-orange-300">{children}</code>,
    pre: ({children}: any) => (
        <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 my-2 overflow-x-auto">
            <pre className="font-mono text-xs text-blue-300 whitespace-pre">{children}</pre>
        </div>
    ),
    blockquote: ({children}: any) => <blockquote className="border-l-2 border-gray-500 pl-3 italic text-gray-400 my-2">{children}</blockquote>,
};

// --- HELPER FUNCTIONS ---

// Convert Gemini Tool definitions to OpenAI JSON Schema
const convertToolsToOpenAI = (tools: FunctionDeclaration[]) => {
    return tools.map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: {
                type: 'object',
                properties: Object.fromEntries(
                    Object.entries(t.parameters?.properties || {}).map(([k, v]: [string, any]) => [
                        k, 
                        { 
                            ...v, 
                            type: (v.type as string).toLowerCase() // OpenAI uses lowercase types
                        }
                    ])
                ),
                required: t.parameters?.required
            }
        }
    }));
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onAgentCreate, 
  onAgentDelete, 
  onAgentReparent,
  onAgentUpdate,
  onRestoreTree,
  onResetTree,
  treeData,
  treeContext,
  getFreshContext
}) => {
  // --- STATE ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Settings State
  const [provider, setProvider] = useState<ApiProvider>(() => (localStorage.getItem('roblox_explorer_provider') as ApiProvider) || 'google');
  const [settings, setSettings] = useState<Record<ApiProvider, ProviderSettings>>(() => {
      const saved = localStorage.getItem('roblox_explorer_settings');
      return saved ? JSON.parse(saved) : {
          google: { apiKey: '', modelId: DEFAULT_MODELS.google, baseUrl: '' },
          openai: { apiKey: '', modelId: DEFAULT_MODELS.openai, baseUrl: DEFAULT_BASE_URLS.openai },
          anthropic: { apiKey: '', modelId: DEFAULT_MODELS.anthropic, baseUrl: DEFAULT_BASE_URLS.anthropic }
      };
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false); // Restore Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  
  // Click outside handler for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Persist Settings
  useEffect(() => {
      localStorage.setItem('roblox_explorer_provider', provider);
      localStorage.setItem('roblox_explorer_settings', JSON.stringify(settings));
  }, [provider, settings]);

  // Session Persist
  useEffect(() => {
      if (sessions.length > 0) {
          localStorage.setItem('roblox_explorer_sessions', JSON.stringify(sessions));
      }
  }, [sessions]);

  // Initialize Session
  useEffect(() => {
    const savedSessions = localStorage.getItem('roblox_explorer_sessions');
    if (savedSessions) {
        try {
            const parsed = JSON.parse(savedSessions);
            setSessions(parsed);
            if (parsed.length > 0) {
                const mostRecent = parsed.sort((a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp)[0];
                setCurrentSessionId(mostRecent.id);
                setMessages(mostRecent.messages);
            } else {
                createNewSession();
            }
        } catch (e) { createNewSession(); }
    } else { createNewSession(); }
  }, []);

  // Update Session on Message Change
  useEffect(() => {
      if (!currentSessionId) return;
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              return {
                  ...session,
                  messages: messages,
                  treeSnapshot: treeData, 
                  timestamp: Date.now(),
                  title: (session.title === "New Workspace" && messages.length > 0 && messages[0].role === 'user') 
                         ? messages[0].text.slice(0, 30) + (messages[0].text.length > 30 ? "..." : "")
                         : session.title
              };
          }
          return session;
      }));
  }, [messages, treeData, currentSessionId]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- ACTIONS ---

  const createNewSession = () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: "New Workspace",
          messages: [],
          timestamp: Date.now(),
          treeSnapshot: [] 
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      setMessages([]);
      onResetTree(); 
      setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
      if (session.id === currentSessionId) { setIsSidebarOpen(false); return; }
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      if (session.treeSnapshot && session.treeSnapshot.length > 0) {
          onRestoreTree(session.treeSnapshot);
      } else {
          onResetTree();
      }
      setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); e.preventDefault(); 
      if (sessions.length <= 1) return;
      const remainingSessions = sessions.filter(s => s.id !== id);
      setSessions(remainingSessions);
      if (currentSessionId === id) {
          const nextSession = remainingSessions[0];
          setCurrentSessionId(nextSession.id);
          setMessages(nextSession.messages);
          if (nextSession.treeSnapshot?.length > 0) onRestoreTree(nextSession.treeSnapshot);
          else onResetTree();
      }
  };

  // --- TOOL LOGIC ---

  const getTools = () => {
      return [
        {
            name: 'createInstance',
            description: 'Creates a new object or script in the Workspace. Returns the new object ID.',
            parameters: {
            type: Type.OBJECT,
            properties: {
                className: { type: Type.STRING, description: 'Class name', enum: Object.values(ClassName) },
                name: { type: Type.STRING, description: 'Name of object' },
                scriptContent: { type: Type.STRING, description: 'Luau code if script' },
                parentId: { type: Type.STRING, description: 'Parent ID' }
            },
            required: ['className', 'name']
            }
        },
        {
            name: 'deleteInstance',
            description: 'Deletes an object by ID.',
            parameters: {
                type: Type.OBJECT,
                properties: { id: { type: Type.STRING, description: 'ID to delete' } },
                required: ['id']
            }
        },
        {
            name: 'reparentInstance',
            description: 'Moves an object.',
            parameters: {
                type: Type.OBJECT,
                properties: { id: { type: Type.STRING }, newParentId: { type: Type.STRING } },
                required: ['id', 'newParentId']
            }
        },
        {
            name: 'updateInstance',
            description: 'Updates properties of an existing object. Use "Source" to update script code.',
            parameters: {
                type: Type.OBJECT,
                properties: { 
                    id: { type: Type.STRING, description: 'ID of the object to update' },
                    properties: { 
                        type: Type.OBJECT,
                        description: 'Properties to update',
                        properties: {
                            Name: { type: Type.STRING },
                            Source: { type: Type.STRING, description: "Lua code content" },
                            Color: { type: Type.STRING },
                            Transparency: { type: Type.NUMBER },
                            Anchored: { type: Type.BOOLEAN },
                            CanCollide: { type: Type.BOOLEAN },
                            Text: { type: Type.STRING },
                            Visible: { type: Type.BOOLEAN },
                            Size: { type: Type.STRING },
                            Position: { type: Type.STRING }
                        }
                    } 
                },
                required: ['id', 'properties']
            }
        }
      ] as FunctionDeclaration[];
  };

  const executeToolCall = (name: string, args: any) => {
      try {
          if (name === 'createInstance') {
              onAgentCreate(args.className, args.name, args.scriptContent, args.parentId);
              return `Created ${args.name} (${args.className})`;
          } else if (name === 'deleteInstance') {
              onAgentDelete(args.id);
              return `Deleted ${args.id}`;
          } else if (name === 'reparentInstance') {
              onAgentReparent(args.id, args.newParentId);
              return `Moved ${args.id} to ${args.newParentId}`;
          } else if (name === 'updateInstance') {
              onAgentUpdate(args.id, args.properties);
              return `Updated ${args.id}`;
          }
          return `Unknown tool ${name}`;
      } catch (e) {
          return `Error executing ${name}: ${e}`;
      }
  };

  // --- API HANDLERS ---

  const getSystemPrompt = (context: string) => `You are a Roblox Studio Assistant in PLANNING MODE.
Analyze the user's latest request given the conversation history and the current Context.

Current Explorer Context:
${context}

You must return a JSON object with a "type" field.

Type 1: "chat"
Use this if the user is asking a question or just chatting.
Format: { "type": "chat", "response": "Your conversational response here." }

Type 2: "action"
Use this if the user wants to build, script, or modify the game.
Format: { "type": "action", "steps": ["Step 1 description", "Step 2 description"...] }

CRITICAL RULES for "action":
1. Create a high-level "Bucket List" (checklist) of tasks.
2. **STRICT PROHIBITION**: Do NOT write any Lua code, script content, or implementation details in these steps.
   - CORRECT: "Create a Script named 'Leaderstats' in ServerScriptService."
   - INCORRECT: "Create script with game.Players.PlayerAdded:Connect(function()..."
3. **IMMUTABLE CLASSNAMES**: You cannot change the ClassName of an existing object. If the user wants to change a Part to a Model, you must DELETE the Part and CREATE a Model.
4. The execution phase will handle the coding. Your job here is ONLY to list the items.

Response MimeType: application/json`;

  const getExecutionPrompt = (step: string, context: string) => `You are a Roblox Studio Assistant in EXECUTION MODE.
You are executing a specific item from the plan.

TASK: "${step}"

Current Explorer Context:
${context}

RULES:
1. Execute the requested task using the tools provided.
2. **SCRIPTING**: If the task involves creating or modifying a script:
   - YOU are responsible for writing the logic NOW.
   - Generate the full, functional Luau code.
   - Pass the code to the 'scriptContent' parameter (if creating) or 'Source' property (if updating).
3. **NO CLASSNAME CHANGES**: Do NOT try to update the 'ClassName' property of an object. It is read-only.
4. Use the Context to find parent IDs if needed.
`;

  // --- MAIN SEND HANDLER ---

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const currentSettings = settings[provider];
    const apiKey = currentSettings.apiKey || process.env.API_KEY || "";
    
    // Check if key is needed
    if (!apiKey && provider !== 'google') { // Google can sometimes work with IDX internal keys
        setIsSettingsOpen(true);
        return;
    }

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    const newMsgs = [...messages, { id: Date.now().toString(), role: 'user' as const, text: userMessage, timestamp: Date.now() }];
    setMessages(newMsgs);

    try {
        const currentContext = getFreshContext();
        
        // 1. PLAN PHASE
        let planType = 'chat';
        let checklistItems: ChecklistItem[] = [];
        let chatResponse = "";

        if (provider === 'google') {
            const ai = new GoogleGenAI({ apiKey });
            const chat = ai.chats.create({
                model: currentSettings.modelId,
                // Use 'messages' (past history) instead of 'newMsgs' (which includes current)
                history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                config: { systemInstruction: getSystemPrompt(currentContext), responseMimeType: 'application/json' }
            });
            // Pass message as object to satisfy new SDK requirements
            const res = await chat.sendMessage({ message: userMessage });
            const raw = JSON.parse(res.text || "{}");
            if (raw.type === 'action') {
                planType = 'action';
                checklistItems = raw.steps.map((s: any, i: number) => ({ id: `s-${i}`, text: typeof s === 'string' ? s : JSON.stringify(s), completed: false }));
            } else {
                chatResponse = raw.response || raw.message || "I'm not sure.";
            }

        } else if (provider === 'openai') {
            const msgs = [
                { role: 'system', content: getSystemPrompt(currentContext) },
                ...newMsgs.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }))
            ];
            const res = await fetch(`${currentSettings.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: currentSettings.modelId,
                    messages: msgs,
                    response_format: { type: "json_object" }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            const raw = JSON.parse(data.choices[0].message.content);
             if (raw.type === 'action') {
                planType = 'action';
                checklistItems = raw.steps.map((s: any, i: number) => ({ id: `s-${i}`, text: typeof s === 'string' ? s : JSON.stringify(s), completed: false }));
            } else {
                chatResponse = raw.response || raw.message || "I'm not sure.";
            }

        } else if (provider === 'anthropic') {
             // Claude doesn't support JSON mode strictly like OpenAI, but handles instructions well
             const msgs = newMsgs.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }));
             const res = await fetch(`${currentSettings.baseUrl}/messages`, {
                method: 'POST',
                headers: { 
                    'x-api-key': apiKey, 
                    'anthropic-version': '2023-06-01', 
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true' // Required for client-side usage
                },
                body: JSON.stringify({
                    model: currentSettings.modelId,
                    system: getSystemPrompt(currentContext),
                    messages: msgs,
                    max_tokens: 1024
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            
            // Try parse JSON from Claude response
            try {
                const text = data.content[0].text;
                // Find JSON block if Claude wrapped it
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const raw = JSON.parse(jsonMatch ? jsonMatch[0] : text);
                if (raw.type === 'action') {
                    planType = 'action';
                    checklistItems = raw.steps.map((s: any, i: number) => ({ id: `s-${i}`, text: typeof s === 'string' ? s : JSON.stringify(s), completed: false }));
                } else {
                    chatResponse = raw.response || raw.message || text;
                }
            } catch (e) {
                chatResponse = data.content[0].text;
            }
        }

        if (planType === 'chat') {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: chatResponse, timestamp: Date.now() }]);
        } else {
            // 2. EXECUTE PHASE
            const checklistMsgId = `msg-${Date.now()}`;
            setMessages(prev => [...prev, { id: checklistMsgId, role: 'model', text: "Starting task execution...", timestamp: Date.now(), checklist: checklistItems }]);

            for (let i = 0; i < checklistItems.length; i++) {
                const item = checklistItems[i];
                const activeContext = getFreshContext();
                const stepPrompt = getExecutionPrompt(item.text, activeContext);
                const tools = getTools();

                let stepOutput = "";

                if (provider === 'google') {
                    const ai = new GoogleGenAI({ apiKey });
                    // Use ai.models.generateContent for tool usage
                    const res = await ai.models.generateContent({
                        model: currentSettings.modelId,
                        contents: item.text,
                        config: {
                            systemInstruction: stepPrompt,
                            tools: [{ functionDeclarations: tools }]
                        }
                    });
                    
                    const fc = res.functionCalls;
                    if (fc && fc.length > 0) {
                        for (const call of fc) {
                            stepOutput += executeToolCall(call.name, call.args) + "\n";
                        }
                    } else {
                        stepOutput = res.text || "Done.";
                    }

                } else if (provider === 'openai') {
                     const openAITools = convertToolsToOpenAI(tools);
                     const res = await fetch(`${currentSettings.baseUrl}/chat/completions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: currentSettings.modelId,
                            messages: [{ role: 'system', content: stepPrompt }, { role: 'user', content: item.text }],
                            tools: openAITools,
                            tool_choice: 'auto'
                        })
                    });
                    const data = await res.json();
                    if (data.choices[0].message.tool_calls) {
                        for (const tc of data.choices[0].message.tool_calls) {
                            const args = JSON.parse(tc.function.arguments);
                            stepOutput += executeToolCall(tc.function.name, args) + "\n";
                        }
                    } else {
                        stepOutput = data.choices[0].message.content || "Done.";
                    }

                } else if (provider === 'anthropic') {
                    // Claude Tool Use
                    const anthropicTools = convertToolsToOpenAI(tools).map(t => ({
                        name: t.function.name,
                        description: t.function.description,
                        input_schema: t.function.parameters
                    }));
                    
                    const res = await fetch(`${currentSettings.baseUrl}/messages`, {
                        method: 'POST',
                        headers: { 
                            'x-api-key': apiKey, 
                            'anthropic-version': '2023-06-01', 
                            'content-type': 'application/json',
                            'dangerously-allow-browser': 'true'
                        },
                        body: JSON.stringify({
                            model: currentSettings.modelId,
                            system: stepPrompt,
                            messages: [{ role: 'user', content: item.text }],
                            max_tokens: 1024,
                            tools: anthropicTools
                        })
                    });
                    const data = await res.json();
                    if (data.content) {
                        for (const block of data.content) {
                            if (block.type === 'tool_use') {
                                stepOutput += executeToolCall(block.name, block.input) + "\n";
                            } else if (block.type === 'text') {
                                // Ignore chatting during execution unless error
                            }
                        }
                    }
                }
                
                // Update UI Checkbox
                setMessages(prev => prev.map(msg => {
                    if (msg.id === checklistMsgId && msg.checklist) {
                        return { ...msg, checklist: msg.checklist.map(it => it.id === item.id ? { ...it, completed: true } : it) };
                    }
                    return msg;
                }));
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "All steps completed.", timestamp: Date.now() }]);
        }

    } catch (error: any) {
        console.error("AI Error", error);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${error.message}`, timestamp: Date.now() }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentSettings = settings[provider];
  const hasConfiguredKey = !!currentSettings.apiKey || (provider === 'google' && !!process.env.API_KEY);
  const activeModelId = settings[provider].modelId;
  const isCustom = !STANDARD_MODELS.find(m => m.id === activeModelId && provider === 'google');
  const currentModelLabel = isCustom ? 'Custom Agent' : STANDARD_MODELS.find(m => m.id === activeModelId)?.label;

  return (
    <div className="flex h-full bg-[#252526] font-sans text-xs relative overflow-hidden">
        
        {/* Sidebar */}
        <div 
            className={`
                absolute inset-y-0 left-0 bg-[#1e1e1e] border-r border-[#3e3e42] z-20 w-64 transform transition-transform duration-200 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="p-2 border-b border-[#3e3e42] flex items-center justify-between">
                <span className="font-bold text-gray-300 px-2">Workspaces</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:text-white text-gray-400">
                    <Menu size={14} />
                </button>
            </div>
            <div className="p-2">
                <button onClick={createNewSession} className="w-full flex items-center space-x-2 bg-[#2d2d2d] hover:bg-[#3e3e42] text-white p-2 rounded border border-[#3e3e42] mb-2 transition-colors">
                    <Plus size={14} />
                    <span>New Workspace</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {sessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className={`group flex items-center justify-between p-2 rounded cursor-pointer select-none relative ${currentSessionId === session.id ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2d2d2d]'}`}
                    >
                        <div className="flex items-center overflow-hidden flex-1">
                            <MessageSquare size={12} className="mr-2 flex-shrink-0" />
                            <span className="truncate text-[11px]">{session.title}</span>
                        </div>
                        {sessions.length > 1 && (
                            <button onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-gray-500 transition-opacity z-10">
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
            
            {/* Header */}
            <div className="flex items-center px-2 py-1 bg-[#2d2d2d] border-b border-[#1e1e1e] min-h-[26px] select-none justify-between">
                <div className="flex items-center">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-2 text-gray-400 hover:text-white p-0.5 rounded flex-shrink-0">
                        <Menu size={14} />
                    </button>
                    
                    {/* Provider Icon */}
                    {provider === 'google' && <Sparkles size={12} className="text-blue-400 mr-2 flex-shrink-0" />}
                    {provider === 'openai' && <Cpu size={12} className="text-green-400 mr-2 flex-shrink-0" />}
                    {provider === 'anthropic' && <Bot size={12} className="text-orange-400 mr-2 flex-shrink-0" />}

                    {/* Model Dropdown Trigger */}
                    <div className="relative" ref={modelMenuRef}>
                        <button 
                            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                            className="flex items-center hover:bg-[#3e3e42] rounded px-2 py-1 transition-colors group space-x-1"
                        >
                            <span className={`font-bold text-[11px] ${isCustom ? 'text-blue-400' : 'text-gray-300'}`}>
                                {currentModelLabel}
                            </span>
                            <ChevronDown size={10} className="text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {isModelMenuOpen && (
                            <div className="absolute top-full left-0 mt-1 w-[220px] bg-[#252526] border border-[#3e3e42] shadow-xl rounded-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                {STANDARD_MODELS.map(model => (
                                    <div 
                                        key={model.id}
                                        onClick={() => {
                                            setProvider('google');
                                            setSettings(prev => ({ ...prev, google: { ...prev.google, modelId: model.id } }));
                                            setIsModelMenuOpen(false);
                                        }}
                                        className="px-3 py-2 hover:bg-[#094771] hover:text-white cursor-pointer border-b border-[#3e3e42] last:border-0 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-gray-200 group-hover:text-white">{model.label}</span>
                                            {activeModelId === model.id && provider === 'google' && <Check size={12} className="text-blue-400 group-hover:text-white" />}
                                        </div>
                                        <div className="text-[10px] text-gray-500 group-hover:text-gray-300 mt-0.5">{model.desc}</div>
                                    </div>
                                ))}
                                
                                {/* Custom Option */}
                                <div 
                                    onClick={() => {
                                        if (provider === 'google') {
                                            setProvider('openai');
                                        }
                                        setIsSettingsOpen(true);
                                        setIsModelMenuOpen(false);
                                    }}
                                    className="px-3 py-2 hover:bg-[#3e3e42] cursor-pointer border-t border-[#3e3e42] flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-semibold text-xs text-gray-300 group-hover:text-white">Custom Agent</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Configure OpenAI / Claude</div>
                                    </div>
                                    {isCustom && <Settings size={12} className="text-blue-400" />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center">
                     <span className="text-gray-500 font-normal truncate mx-2 max-w-[150px]">
                        {sessions.find(s => s.id === currentSessionId)?.title}
                    </span>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className={`p-1.5 rounded transition-colors ${hasConfiguredKey ? 'text-green-500' : 'text-red-500 animate-pulse'}`}
                        title={hasConfiguredKey ? "Ready" : "Configuration Required"}
                    >
                        <Key size={12} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-[#1e1e1e]">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4">
                        <div className="mb-4 relative">
                            <Bot size={48} className="text-blue-400 opacity-20" />
                            <Settings size={20} className="absolute -bottom-1 -right-1 text-gray-500 bg-[#1e1e1e] rounded-full p-0.5 cursor-pointer hover:text-white" onClick={() => setIsSettingsOpen(true)} />
                        </div>
                        <p className="font-bold text-sm text-gray-400">Assistant Ready</p>
                        <p className="mt-1 text-xs max-w-[200px] mb-4">
                            Running on <span className="text-blue-400 font-mono">{settings[provider].modelId}</span> via {provider}.
                        </p>
                        
                        {!hasConfiguredKey && (
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors flex items-center space-x-2"
                            >
                                <Key size={14} />
                                <span>Configure API Key</span>
                            </button>
                        )}
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-center mb-1 ml-1 space-x-1.5">
                             {msg.role === 'model' ? (
                                <Bot size={12} className="text-blue-400" />
                             ) : (
                                <UserIcon size={12} className="text-gray-400" />
                             )}
                             <span className="text-[10px] text-gray-500">
                                {msg.role === 'model' ? 'Assistant' : 'You'}
                             </span>
                        </div>
                        <div className={`max-w-[90%] rounded px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm border ${msg.role === 'user' ? 'bg-[#0078d4] text-white border-transparent' : 'bg-[#2d2d2d] text-gray-200 border-[#3e3e42]'}`}>
                            {msg.checklist ? (
                                <div className="flex flex-col space-y-2 min-w-[220px]">
                                    <div className="flex items-center space-x-2 text-gray-400 border-b border-[#3e3e42] pb-1 mb-1">
                                        <ListTodo size={12} />
                                        <span className="font-bold">Execution Plan</span>
                                    </div>
                                    {msg.checklist.map((item) => (
                                        <div key={item.id} className={`flex items-start space-x-2 ${item.completed ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className={`mt-1 w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-green-500/20 border-green-500' : 'border-gray-500'}`}>
                                                {item.completed && <Check size={10} className="text-green-500" />}
                                            </div>
                                            <div className={`flex-1 min-w-0 ${item.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                                <ReactMarkdown components={MarkdownComponents}>
                                                    {item.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ReactMarkdown components={MarkdownComponents}>
                                    {msg.text}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex flex-col items-start animate-in fade-in duration-300">
                         <div className="flex items-center mb-1 ml-1 space-x-1.5">
                             <Bot size={12} className="text-blue-400" />
                             <span className="text-[10px] text-gray-500">Assistant</span>
                         </div>
                         <div className="bg-[#2d2d2d] border border-[#3e3e42] rounded px-3 py-2 text-[11px] text-gray-400 flex items-center space-x-2">
                             <Loader2 size={12} className="animate-spin text-blue-400" />
                             <span>Processing...</span>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 bg-[#2d2d2d] border-t border-[#1e1e1e]">
                <div className="relative flex items-center bg-[#1e1e1e] border border-[#3e3e42] rounded-sm focus-within:border-blue-500">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={hasConfiguredKey ? `Message ${settings[provider].modelId}...` : "Configure API settings..."}
                        className="flex-1 bg-transparent text-gray-200 text-xs px-2 py-1.5 outline-none placeholder-gray-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50">
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>

        {isSidebarOpen && <div className="absolute inset-0 bg-black/50 z-10" onClick={() => setIsSidebarOpen(false)} />}

        {/* SETTINGS MODAL */}
        {isSettingsOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-[#252526] border border-[#3e3e42] rounded-md shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-[#3e3e42] bg-[#2d2d2d]">
                        <span className="font-bold text-gray-200">
                            {provider === 'google' ? 'Google Configuration' : 'Custom Agent Settings'}
                        </span>
                        <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white"><X size={14} /></button>
                    </div>
                    
                    <div className="p-4 space-y-4 overflow-y-auto">
                        {/* Provider Select - HIDDEN FOR GOOGLE */}
                        {provider !== 'google' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Provider</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setProvider('openai')}
                                        className={`flex flex-col items-center p-2 rounded border transition-all ${provider === 'openai' ? 'bg-[#107c10] border-green-400 text-white' : 'bg-[#1e1e1e] border-[#3e3e42] text-gray-400 hover:bg-[#3e3e42]'}`}
                                    >
                                        <Cpu size={16} className="mb-1" />
                                        <span className="text-[10px] font-bold">OpenAI</span>
                                    </button>
                                    <button 
                                        onClick={() => setProvider('anthropic')}
                                        className={`flex flex-col items-center p-2 rounded border transition-all ${provider === 'anthropic' ? 'bg-[#d97706] border-orange-400 text-white' : 'bg-[#1e1e1e] border-[#3e3e42] text-gray-400 hover:bg-[#3e3e42]'}`}
                                    >
                                        <Bot size={16} className="mb-1" />
                                        <span className="text-[10px] font-bold">Claude</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="w-full h-[1px] bg-[#3e3e42]" />

                        {/* Model ID */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Model ID</label>
                            <input 
                                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 text-white text-xs outline-none focus:border-blue-500 font-mono"
                                value={settings[provider].modelId}
                                onChange={(e) => setSettings({ ...settings, [provider]: { ...settings[provider], modelId: e.target.value } })}
                                placeholder="e.g. gpt-4o"
                            />
                            <div className="text-[10px] text-gray-500">
                                {provider === 'google' && "Selected via dropdown (e.g. gemini-2.5-flash)"}
                                {provider === 'openai' && "Common: gpt-4o, gpt-3.5-turbo"}
                                {provider === 'anthropic' && "Common: claude-3-5-sonnet-20240620"}
                            </div>
                        </div>

                        {/* Base URL (Optional) */}
                        {provider !== 'google' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center">
                                    <Server size={10} className="mr-1" />
                                    Base URL
                                </label>
                                <input 
                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 text-white text-xs outline-none focus:border-blue-500 font-mono text-gray-400"
                                    value={settings[provider].baseUrl}
                                    onChange={(e) => setSettings({ ...settings, [provider]: { ...settings[provider], baseUrl: e.target.value } })}
                                    placeholder="https://api.openai.com/v1"
                                />
                                <div className="text-[10px] text-gray-600">
                                    Use this for local models (e.g. Ollama, LM Studio) or proxies.
                                </div>
                            </div>
                        )}

                        {/* API Key */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                                <span>API Key</span>
                                <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => {
                                    if(provider === 'google') window.open('https://aistudio.google.com/app/apikey');
                                    if(provider === 'openai') window.open('https://platform.openai.com/api-keys');
                                    if(provider === 'anthropic') window.open('https://console.anthropic.com/');
                                }}>Get Key</span>
                            </label>
                            <div className="relative">
                                <Key size={12} className="absolute left-2 top-2.5 text-gray-500" />
                                <input 
                                    type="password"
                                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 pl-7 text-white text-xs outline-none focus:border-blue-500"
                                    value={settings[provider].apiKey}
                                    onChange={(e) => setSettings({ ...settings, [provider]: { ...settings[provider], apiKey: e.target.value } })}
                                    placeholder={`sk-...`}
                                />
                            </div>
                             <div className="text-[9px] text-gray-600 mt-1">
                                Keys are stored locally in your browser.
                                {provider === 'anthropic' && " Note: Claude direct calls require a CORS proxy or local environment."}
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border-t border-[#3e3e42] bg-[#2d2d2d] flex justify-end">
                        <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
