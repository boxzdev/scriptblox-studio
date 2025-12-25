
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, FileCode } from 'lucide-react';
import { ExplorerNode, ClassName } from '../types';

interface ScriptEditorProps {
  selectedNode: ExplorerNode | null;
  initialContents: Record<string, string>; // ID -> Content map
  allNodeIds: Set<string>;
  onScriptChange: (id: string, content: string) => void;
}

interface ScriptTab {
  id: string;
  name: string;
  className: ClassName;
  content: string;
}

// --- SYNTAX HIGHLIGHTER UTILS ---

const LUAU_KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'for', 'function', 
  'if', 'in', 'local', 'not', 'or', 'repeat', 'return', 'then', 
  'until', 'while', 'self', 'continue', 'export', 'type'
]);

// Values that should be highlighted Orange (same as numbers)
const LUAU_VALUES = new Set(['true', 'false', 'nil']);

// Colors specifically requested
const COLORS = {
  keyword: '#F86D7C', // Red/Pink (local, function)
  comment: '#ADF195', // Green (Requested for comments)
  string: '#ADF195',  // Green (Standard for strings, matches comment request)
  number: '#FFC600',  // Orange (Requested for numbers like 120, and nil/true/false)
  text: '#CCCCCC',    // Default White/Grey
};

const tokenizeLuau = (code: string) => {
    const tokens: { type: string, value: string }[] = [];
    
    // Simplified Tokenizer Regex
    // Fix: Use non-capturing group (?:...) for decimals to maintain group indices
    // 1. Comments: -- to end of line
    // 2. Strings: "..." or '...'
    // 3. Numbers: 123, 1.5
    // 4. Identifiers: Words
    // 5. Whitespace: Space, tabs, newlines
    // 6. Symbols: Everything else
    const regex = /(--.*$)|(["'](?:[^"'\\]|\\.)*["'])|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b)|(\s+)|(.)/gm;
    
    let match;
    while ((match = regex.exec(code)) !== null) {
        // Destructuring relies on exact group positions
        const [full, comment, string, number, identifier, whitespace, symbol] = match;
        
        if (comment) {
            tokens.push({ type: 'comment', value: comment });
        } else if (string) {
            tokens.push({ type: 'string', value: string });
        } else if (number) {
            tokens.push({ type: 'number', value: number });
        } else if (identifier) {
            if (LUAU_KEYWORDS.has(identifier)) {
                tokens.push({ type: 'keyword', value: identifier });
            } else if (LUAU_VALUES.has(identifier)) {
                // Map true/false/nil to 'number' type to use the Orange color
                tokens.push({ type: 'number', value: identifier });
            } else {
                tokens.push({ type: 'text', value: identifier });
            }
        } else if (whitespace) {
            tokens.push({ type: 'text', value: whitespace });
        } else if (symbol) {
            tokens.push({ type: 'text', value: symbol });
        }
    }
    return tokens;
};

// --- CODE EDITOR COMPONENT ---

const CodeEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const tokens = useMemo(() => tokenizeLuau(value), [value]);

    const highlightedCode = tokens.map((token, i) => {
        let color = COLORS.text;
        
        if (token.type === 'comment') color = COLORS.comment;
        else if (token.type === 'string') color = COLORS.string;
        else if (token.type === 'keyword') color = COLORS.keyword;
        else if (token.type === 'number') color = COLORS.number;
        
        return <span key={i} style={{ color }}>{token.value}</span>;
    });

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#1e1e1e] font-mono text-[13px] leading-5">
            {/* Highlight Layer */}
            <pre
                ref={preRef}
                className="absolute inset-0 m-0 p-1 pl-2 pointer-events-none whitespace-pre overflow-hidden font-mono"
                style={{ fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace" }}
            >
                {highlightedCode}
                <br /> 
            </pre>
            
            {/* Input Layer */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none border-none whitespace-pre overflow-auto p-1 pl-2 font-mono"
                style={{ 
                    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                    zIndex: 2
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
            />
        </div>
    );
};

// --- MAIN WRAPPER ---

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ selectedNode, initialContents, allNodeIds, onScriptChange }) => {
  const [tabs, setTabs] = useState<ScriptTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    setTabs(prev => {
        let changed = false;
        const next = prev.map(tab => {
            const external = initialContents[tab.id];
            const lastEmitted = lastEmittedRef.current[tab.id];
            if (external !== undefined && external !== tab.content) {
                 if (external !== lastEmitted) {
                     changed = true;
                     lastEmittedRef.current[tab.id] = external;
                     return { ...tab, content: external };
                 }
            }
            return tab;
        });
        return changed ? next : prev;
    });
  }, [initialContents]);

  useEffect(() => {
    if (selectedNode) {
      const isScript = 
        selectedNode.className === ClassName.Script || 
        selectedNode.className === ClassName.LocalScript || 
        selectedNode.className === ClassName.ModuleScript;

      if (isScript) {
        setTabs(prev => {
          const existing = prev.find(t => t.id === selectedNode.id);
          if (existing) {
            // FIX: Prevent re-render loop by checking if update is actually needed
            if (existing.name === selectedNode.name) {
                return prev;
            }
            return prev.map(t => t.id === selectedNode.id ? { ...t, name: selectedNode.name } : t);
          }

          let initialContent = initialContents[selectedNode.id];
          if (initialContent === undefined) {
            if (selectedNode.className === ClassName.Script) {
                initialContent = `print("Server Script running: ${selectedNode.name}")\n\n-- Server logic goes here`;
            } else if (selectedNode.className === ClassName.LocalScript) {
                initialContent = `print("Local Script running: ${selectedNode.name}")\n\n-- Client logic goes here`;
            } else if (selectedNode.className === ClassName.ModuleScript) {
                initialContent = `local module = {}\n\nreturn module`;
            } else {
                initialContent = "";
            }
          }
          
          // Note: Updating ref in setState callback is generally side-effect prone but handled here for new tab init
          lastEmittedRef.current[selectedNode.id] = initialContent;

          return [...prev, {
            id: selectedNode.id,
            name: selectedNode.name,
            className: selectedNode.className,
            content: initialContent
          }];
        });
        
        setActiveTabId(selectedNode.id);
      }
    }
  }, [selectedNode, initialContents]);

  useEffect(() => {
    setTabs(prev => {
        const newTabs = prev.filter(t => allNodeIds.has(t.id));
        return newTabs.length !== prev.length ? newTabs : prev;
    });
  }, [allNodeIds]);

  useEffect(() => {
    if (activeTabId && !tabs.find(t => t.id === activeTabId)) {
        setActiveTabId(tabs.length > 0 ? tabs[tabs.length - 1].id : null);
    }
  }, [tabs, activeTabId]);

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    delete lastEmittedRef.current[id];

    if (activeTabId === id) {
      if (newTabs.length > 0) {
        const closedIndex = tabs.findIndex(t => t.id === id);
        const newIndex = Math.max(0, closedIndex - 1);
        setActiveTabId(newTabs[newIndex] ? newTabs[newIndex].id : newTabs[0].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
  };

  const updateContent = (newContent: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, content: newContent } : t));
    if (activeTabId) {
        lastEmittedRef.current[activeTabId] = newContent;
        onScriptChange(activeTabId, newContent);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  if (tabs.length === 0 || !activeTab) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-[#555555] select-none">
        <FileCode size={64} className="mb-4 opacity-50" />
        <div className="text-xl font-bold mb-2">No Script Open</div>
        <div className="text-sm">Select a script from the Explorer to view code</div>
      </div>
    );
  }

  const lineCount = activeTab.content.split('\n').length;
  const lines = Math.max(1, lineCount);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Tab Bar */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-[#1e1e1e] overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center h-[28px] px-3 min-w-[120px] max-w-[200px] text-xs select-none cursor-pointer group border-r border-[#1e1e1e]
              ${activeTabId === tab.id 
                ? 'bg-[#1e1e1e] text-[#cccccc] border-t-2 border-t-blue-500' 
                : 'bg-[#2d2d2d] text-[#999999] hover:bg-[#2d2d2d] border-t-2 border-t-transparent hover:text-[#cccccc]'
              }
            `}
          >
            <span className="mr-2 truncate flex-1">{tab.name}</span>
            <div 
              onClick={(e) => handleClose(e, tab.id)}
              className={`
                p-0.5 rounded-sm cursor-pointer
                ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                hover:bg-[#3e3e42]
              `}
            >
              <X size={12} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Editor Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative flex">
             <div 
                ref={lineNumbersRef}
                className="w-10 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col items-end py-1 pr-2 select-none overflow-hidden absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
             >
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="text-[#858585] font-mono text-[13px] leading-5 h-5 flex-shrink-0">
                    {i + 1}
                    </div>
                ))}
             </div>
             
             {/* Main Editor */}
             <div 
                className="flex-1 h-full pl-10"
                onScrollCapture={(e) => {
                    if (lineNumbersRef.current) {
                        lineNumbersRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
                    }
                }}
             >
                 <CodeEditor value={activeTab.content} onChange={updateContent} />
             </div>
        </div>
      </div>
    </div>
  );
};
