
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExplorerItem } from './components/ExplorerItem';
import { initialExplorerData } from './data/initialData';
import { PropertiesPane } from './components/PropertiesPane';
import { ExplorerNode, InstanceProperties, ClassName, BlueprintFile, BlueprintData } from './types';
import { ScriptEditor } from './components/ScriptEditor';
import { TopBar } from './components/TopBar';
import { ChatInterface } from './components/ChatInterface';
import { BlueprintWindow } from './components/BlueprintWindow';
import { Plus, Trash2, Copy } from 'lucide-react';
import { InsertObjectModal } from './components/InsertObjectModal';
import { ContextMenu } from './components/ContextMenu';

const findNodeById = (nodes: ExplorerNode[], id: string): ExplorerNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findParentNode = (nodes: ExplorerNode[], childId: string): ExplorerNode | null => {
    for (const node of nodes) {
        if (node.children) {
            if (node.children.some(c => c.id === childId)) return node;
            const found = findParentNode(node.children, childId);
            if (found) return found;
        }
    }
    return null;
};

const getAllNodeIds = (nodes: ExplorerNode[]): Set<string> => {
    const ids = new Set<string>();
    const traverse = (list: ExplorerNode[]) => {
        for (const node of list) {
            ids.add(node.id);
            if (node.children) traverse(node.children);
        }
    };
    traverse(nodes);
    return ids;
};

const generateTreeContext = (nodes: ExplorerNode[], scripts: Record<string, string>, depth = 0): string => {
  let context = "";
  for (const node of nodes) {
    context += `${"  ".repeat(depth)}- [${node.className}] ${node.name} (ID: ${node.id})\n`;
    if (node.className === ClassName.Script || node.className === ClassName.LocalScript || node.className === ClassName.ModuleScript) {
        const content = scripts[node.id];
        if (content) {
            const indented = content.split('\n').map(line => "  ".repeat(depth + 1) + line).join('\n');
            context += `${"  ".repeat(depth + 1)}>>> SCRIPT SOURCE (${node.className}) >>>\n${indented}\n${"  ".repeat(depth + 1)}<<< END SOURCE <<<\n`;
        }
    }
    if (node.children) {
      context += generateTreeContext(node.children, scripts, depth + 1);
    }
  }
  return context;
};

export default function App() {
  // Explorer State
  const [nodes, setNodes] = useState<ExplorerNode[]>(() => {
    try {
      const savedTree = localStorage.getItem('roblox_explorer_tree');
      return savedTree ? JSON.parse(savedTree) : initialExplorerData;
    } catch (e) {
      return initialExplorerData;
    }
  });

  const [scriptContents, setScriptContents] = useState<Record<string, string>>(() => {
    try {
      const savedScripts = localStorage.getItem('roblox_explorer_scripts');
      return savedScripts ? JSON.parse(savedScripts) : {};
    } catch (e) {
      return {};
    }
  });

  // Blueprint State
  const [blueprintFiles, setBlueprintFiles] = useState<BlueprintFile[]>(() => {
    try {
        const saved = localStorage.getItem('roblox_explorer_blueprint_files');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [activeBlueprintFileId, setActiveBlueprintFileId] = useState<string | null>(null);

  // Clipboard & Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ className: ClassName, name: string, content?: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('roblox_explorer_tree', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('roblox_explorer_scripts', JSON.stringify(scriptContents));
  }, [scriptContents]);

  useEffect(() => {
      localStorage.setItem('roblox_explorer_blueprint_files', JSON.stringify(blueprintFiles));
  }, [blueprintFiles]);

  
  // Layout State
  const [showExplorer, setShowExplorer] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  
  // Rule 5 Compliance: AI Service MUST NOT be removed. 
  // Defaulting to false to satisfy user preference for "Explorer Interface only" without deleting code.
  const [showAssistant, setShowAssistant] = useState(false); 

  const [showBlueprint, setShowBlueprint] = useState(false);
  
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [insertModalPos, setInsertModalPos] = useState<{x: number, y: number} | undefined>(undefined);
  const [insertParentId, setInsertParentId] = useState<string | null>(null);

  // Computed
  const selectedNode = useMemo(() => 
    selectedId ? findNodeById(nodes, selectedId) : null
  , [nodes, selectedId]);

  const allNodeIds = useMemo(() => getAllNodeIds(nodes), [nodes]);

  // Actions
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleUpdateNode = (id: string, key: keyof InstanceProperties | 'Name', value: any) => {
    // Special handling for Script Source
    if (key === 'Source') {
        setScriptContents(prev => ({ ...prev, [id]: value }));
        return;
    }

    const updateRecursive = (list: ExplorerNode[]): ExplorerNode[] => {
      return list.map(node => {
        if (node.id === id) {
           if (key === 'Name') return { ...node, name: value };
           return { ...node, properties: { ...node.properties, [key]: value } };
        }
        if (node.children) {
          return { ...node, children: updateRecursive(node.children) };
        }
        return node;
      });
    };
    setNodes(prev => updateRecursive(prev));
  };

  const handleAgentUpdate = (id: string, updates: Partial<InstanceProperties>) => {
      if (updates.Source) {
          setScriptContents(prev => ({ ...prev, [id]: updates.Source! }));
      }

      const updateRecursive = (list: ExplorerNode[]): ExplorerNode[] => {
        return list.map(node => {
          if (node.id === id) {
            const newName = updates.Name || node.name;
            // Filter out Source/Name from properties object to avoid duplication/confusion
            const { Name, Source, ...otherProps } = updates;
            return { 
                ...node, 
                name: newName,
                properties: { ...node.properties, ...otherProps } 
            };
          }
          if (node.children) {
            return { ...node, children: updateRecursive(node.children) };
          }
          return node;
        });
      };
      setNodes(prev => updateRecursive(prev));
  };

  const handleDelete = (id: string) => {
      const deleteRecursive = (list: ExplorerNode[]): ExplorerNode[] => {
          return list.filter(node => node.id !== id).map(node => ({
              ...node,
              children: node.children ? deleteRecursive(node.children) : []
          }));
      };
      setNodes(prev => deleteRecursive(prev));
      if (selectedId === id) setSelectedId(null);
  };

  const handleInsertRequest = (e: React.MouseEvent) => {
      e.stopPropagation();
      setInsertModalPos({ x: e.clientX, y: e.clientY });
      setInsertParentId(selectedId || '1'); // Default to selected or Workspace
      setShowInsertModal(true);
  };

  const handleInsertObject = (className: ClassName) => {
      const parentId = insertParentId || selectedId || '1';
      handleAgentCreate(className, className, undefined, parentId);
      setShowInsertModal(false);
      setInsertParentId(null);
  };

  const handleAgentCreate = (className: ClassName, name: string, content?: string, parentId?: string) => {
      const newId = Date.now().toString();
      const newNode: ExplorerNode = {
          id: newId,
          name: name,
          className: className,
          children: [],
          properties: {}
      };

      if (content && (className === ClassName.Script || className === ClassName.LocalScript || className === ClassName.ModuleScript)) {
          setScriptContents(prev => ({ ...prev, [newId]: content }));
      }

      const targetParentId = parentId || '1';

      const addToParent = (list: ExplorerNode[]): ExplorerNode[] => {
          return list.map(node => {
              if (node.id === targetParentId) {
                  return { ...node, children: [...(node.children || []), newNode], expanded: true };
              }
              if (node.children) {
                  return { ...node, children: addToParent(node.children) };
              }
              return node;
          });
      };

      setNodes(prev => addToParent(prev));
      setSelectedId(newId);
  };

  const handleAgentReparent = (id: string, newParentId: string) => {
      let nodeToMove: ExplorerNode | null = null;
      
      // 1. Remove
      const removeStep = (list: ExplorerNode[]): ExplorerNode[] => {
          const result: ExplorerNode[] = [];
          for (const node of list) {
              if (node.id === id) {
                  nodeToMove = node;
              } else {
                  const newNode = { ...node };
                  if (node.children) {
                      newNode.children = removeStep(node.children);
                  }
                  result.push(newNode);
              }
          }
          return result;
      };
      
      // 2. Add
      const addStep = (list: ExplorerNode[]): ExplorerNode[] => {
          return list.map(node => {
              if (node.id === newParentId && nodeToMove) {
                  return { ...node, children: [...(node.children || []), nodeToMove] };
              }
              if (node.children) {
                  return { ...node, children: addStep(node.children) };
              }
              return node;
          });
      };

      setNodes(prev => {
          const removed = removeStep(prev);
          if (nodeToMove) {
              return addStep(removed);
          }
          return prev;
      });
  };

  const handleDuplicate = (targetId?: string) => {
      const idToDup = targetId || selectedId;
      if (!idToDup) return;
      
      const nodeToDup = findNodeById(nodes, idToDup);
      if (!nodeToDup) return;

      const parent = findParentNode(nodes, idToDup);
      const parentId = parent ? parent.id : '1'; // Default to Workspace if no parent found (rare)

      handleAgentCreate(nodeToDup.className, nodeToDup.name, scriptContents[nodeToDup.id], parentId);
  };

  // --- CONTEXT MENU HANDLERS ---
  const handleNodeContextMenu = (e: React.MouseEvent, id: string) => {
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
  };

  const handleCopy = (id: string) => {
      const node = findNodeById(nodes, id);
      if (node) {
          setClipboard({
              className: node.className,
              name: node.name,
              content: scriptContents[node.id]
          });
      }
  };

  const handlePaste = (targetId: string) => {
      if (!clipboard) return;
      handleAgentCreate(clipboard.className, clipboard.name, clipboard.content, targetId);
  };

  // Callback for AI to check tree state instantly
  const nodesRef = useRef(nodes);
  const scriptsRef = useRef(scriptContents);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { scriptsRef.current = scriptContents; }, [scriptContents]);

  const getFreshContext = () => {
      return generateTreeContext(nodesRef.current, scriptsRef.current);
  };

  // Blueprint Handlers
  const handleCreateBlueprint = () => {
      const newFile: BlueprintFile = {
          id: Date.now().toString(),
          name: 'New Blueprint',
          content: { nodes: [], connections: [], viewport: { x: 0, y: 0, zoom: 1 } },
          updatedAt: Date.now()
      };
      setBlueprintFiles(prev => [...prev, newFile]);
      setActiveBlueprintFileId(newFile.id);
  };

  const handleDeleteBlueprint = (id: string) => {
      setBlueprintFiles(prev => prev.filter(f => f.id !== id));
      if (activeBlueprintFileId === id) setActiveBlueprintFileId(null);
  };

  const handleUpdateBlueprint = (id: string, updates: Partial<BlueprintFile>) => {
      setBlueprintFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleUpdateBlueprintData = (data: BlueprintData) => {
      if (activeBlueprintFileId) {
          handleUpdateBlueprint(activeBlueprintFileId, { content: data, updatedAt: Date.now() });
      }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden" onContextMenu={e => e.preventDefault()}>
      <TopBar 
        showExplorer={showExplorer}
        onToggleExplorer={() => setShowExplorer(!showExplorer)}
        showProperties={showProperties}
        onToggleProperties={() => setShowProperties(!showProperties)}
        showAssistant={showAssistant}
        onToggleAssistant={() => setShowAssistant(!showAssistant)}
        showBlueprint={showBlueprint}
        onToggleBlueprint={() => setShowBlueprint(!showBlueprint)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content (Script Editor) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
           <ScriptEditor 
             selectedNode={selectedNode} 
             initialContents={scriptContents}
             allNodeIds={allNodeIds}
             onScriptChange={(id, content) => setScriptContents(prev => ({ ...prev, [id]: content }))}
           />
        </div>

        {/* Right Sidebar - Multi-Column Layout per Rule 6 */}
        {(showExplorer || showProperties || showAssistant) && (
            <div className="flex border-l border-[#1e1e1e] h-full flex-shrink-0 bg-[#252526] select-none shadow-xl z-10">
                
                {/* Inner Column: Explorer & Properties */}
                {(showExplorer || showProperties) && (
                    <div className={`flex flex-col h-full border-r border-[#3e3e42] ${showAssistant ? 'w-[280px]' : 'w-[300px]'}`}>
                        
                        {/* EXPLORER PANEL */}
                        {showExplorer && (
                            <div className={`flex flex-col ${showProperties ? 'h-1/2 border-b border-[#3e3e42]' : 'h-full'}`}>
                                <div className="flex items-center justify-between px-2 py-1 bg-[#2d2d2d] border-b border-[#1e1e1e]">
                                    <span className="font-bold text-[11px] text-gray-300">Explorer</span>
                                    <div className="flex items-center space-x-1">
                                        <button onClick={handleInsertRequest} className="p-0.5 hover:bg-[#3e3e42] rounded text-gray-400" title="Insert Object">
                                            <Plus size={12} />
                                        </button>
                                        <button onClick={() => handleDuplicate()} className="p-0.5 hover:bg-[#3e3e42] rounded text-gray-400" title="Duplicate Selection">
                                            <Copy size={12} />
                                        </button>
                                        <button 
                                            onClick={() => selectedId && handleDelete(selectedId)} 
                                            className="p-0.5 hover:bg-[#3e3e42] rounded text-gray-400 hover:text-red-400"
                                            title="Delete Selection"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 bg-[#222222]">
                                    {nodes.map(node => (
                                        <ExplorerItem 
                                            key={node.id} 
                                            node={node} 
                                            selectedId={selectedId} 
                                            onSelect={handleSelect}
                                            onContextMenu={handleNodeContextMenu}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PROPERTIES PANEL */}
                        {showProperties && (
                            <div className={`flex flex-col ${showExplorer ? 'h-1/2' : 'h-full'}`}>
                                <PropertiesPane 
                                    node={selectedNode} 
                                    onChange={(k, v) => selectedId && handleUpdateNode(selectedId, k, v)} 
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Outer Column: AI Assistant (Full Height) */}
                {showAssistant && (
                    <div className="w-[300px] h-full flex flex-col bg-[#252526]">
                        <ChatInterface 
                            onAgentCreate={handleAgentCreate}
                            onAgentDelete={handleDelete}
                            onAgentReparent={handleAgentReparent}
                            onAgentUpdate={handleAgentUpdate}
                            onRestoreTree={setNodes}
                            onResetTree={() => setNodes(initialExplorerData)}
                            treeData={nodes}
                            treeContext={generateTreeContext(nodes, scriptContents)}
                            getFreshContext={getFreshContext}
                        />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Floating Windows */}
      <BlueprintWindow 
         isOpen={showBlueprint}
         onClose={() => setShowBlueprint(false)}
         files={blueprintFiles}
         activeFileId={activeBlueprintFileId}
         onSelectFile={setActiveBlueprintFileId}
         onCreateFile={handleCreateBlueprint}
         onDeleteFile={handleDeleteBlueprint}
         onUpdateFile={handleUpdateBlueprint}
         onUpdateData={handleUpdateBlueprintData}
      />
      
      <InsertObjectModal 
        isOpen={showInsertModal} 
        onClose={() => setShowInsertModal(false)} 
        onSelect={handleInsertObject}
        position={insertModalPos}
      />

      {contextMenu && (
          <ContextMenu 
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              actions={[
                  { 
                      label: "Insert Object...", 
                      onClick: () => {
                          setInsertModalPos({ x: contextMenu.x, y: contextMenu.y });
                          setInsertParentId(contextMenu.nodeId);
                          setShowInsertModal(true);
                      },
                      shortcut: "Ctrl+I" 
                  },
                  { separator: true, label: '', onClick: () => {} },
                  { 
                      label: "Cut", 
                      onClick: () => {
                          handleCopy(contextMenu.nodeId);
                          handleDelete(contextMenu.nodeId);
                      },
                      shortcut: "Ctrl+X" 
                  },
                  { 
                      label: "Copy", 
                      onClick: () => handleCopy(contextMenu.nodeId),
                      shortcut: "Ctrl+C" 
                  },
                  { 
                      label: "Paste Into", 
                      onClick: () => handlePaste(contextMenu.nodeId),
                      disabled: !clipboard,
                      shortcut: "Ctrl+Shift+V" 
                  },
                  { 
                      label: "Duplicate", 
                      onClick: () => handleDuplicate(contextMenu.nodeId),
                      shortcut: "Ctrl+D" 
                  },
                  { separator: true, label: '', onClick: () => {} },
                  { 
                      label: "Delete", 
                      onClick: () => handleDelete(contextMenu.nodeId),
                      danger: true,
                      shortcut: "Del" 
                  },
                  { 
                      label: "Rename", 
                      onClick: () => {
                         // Simple prompt for now as an MVP Rename feature
                         const node = findNodeById(nodes, contextMenu.nodeId);
                         if (node) {
                             const newName = prompt("Rename Object", node.name);
                             if (newName) handleUpdateNode(contextMenu.nodeId, 'Name', newName);
                         }
                      },
                      shortcut: "F2" 
                  }
              ]}
          />
      )}
    </div>
  );
}
