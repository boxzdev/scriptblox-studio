
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Box, X, GripHorizontal, Type, ArrowRight, MousePointer2, RotateCw, Hand, Target, ZoomIn, ZoomOut } from 'lucide-react';
import { BlueprintData, BlueprintNode, BlueprintConnection, BlueprintNodeType } from '../types';

interface BlueprintCanvasProps {
  data: BlueprintData;
  onChange: (data: BlueprintData) => void;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ data, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingPin, setConnectingPin] = useState<{ nodeId: string, pinId: string, type: 'input' | 'output', x: number, y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Refs for logic
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const initialViewportRef = useRef(data.viewport);
  const initialNodePosRef = useRef<{ x: number, y: number } | null>(null);

  // --- HANDLERS ---

  const handleMouseDown = (e: React.MouseEvent) => {
    // Panning Triggers:
    // 1. Middle Mouse Button
    // 2. Left Click + Alt Key
    // 3. Left Click while in Pan Mode
    const isPanTrigger = e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && activeTool === 'pan');

    if (isPanTrigger) {
        setIsPanning(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        initialViewportRef.current = { ...data.viewport };
        e.preventDefault();
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    
    // If in Pan mode, allow event to bubble up to container for panning
    if (activeTool === 'pan') return;

    // Stop propagation so canvas pan doesn't start (in select mode)
    e.stopPropagation();

    const target = e.target as HTMLElement;
    // If clicking strictly on an input/textarea, let it focus, don't drag
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    setDraggingNodeId(nodeId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    const node = data.nodes.find(n => n.id === nodeId);
    if (node) {
        initialNodePosRef.current = { x: node.x, y: node.y };
    }
  };

  const handlePinMouseDown = (e: React.MouseEvent, nodeId: string, pinId: string, type: 'input' | 'output') => {
    // Disable connecting in Pan mode
    if (activeTool === 'pan') return;

    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
        const pinX = rect.left + rect.width / 2 - containerRect.left;
        const pinY = rect.top + rect.height / 2 - containerRect.top;
        setConnectingPin({ nodeId, pinId, type, x: pinX, y: pinY });
    }
  };

  const handlePinMouseUp = (e: React.MouseEvent, nodeId: string, pinId: string, type: 'input' | 'output') => {
    e.stopPropagation();
    if (connectingPin) {
        if (connectingPin.nodeId === nodeId) {
            setConnectingPin(null);
            return;
        }
        if (connectingPin.type === type) {
            setConnectingPin(null);
            return;
        }

        const newConnection: BlueprintConnection = {
            id: Date.now().toString(),
            sourceNodeId: connectingPin.type === 'output' ? connectingPin.nodeId : nodeId,
            sourcePinId: connectingPin.type === 'output' ? connectingPin.pinId : pinId,
            targetNodeId: connectingPin.type === 'input' ? connectingPin.nodeId : nodeId,
            targetPinId: connectingPin.type === 'input' ? connectingPin.pinId : pinId,
        };

        onChange({
            ...data,
            connections: [...data.connections, newConnection]
        });
        setConnectingPin(null);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ 
            x: e.clientX - rect.left, 
            y: e.clientY - rect.top 
        });
    }

    if (isPanning && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        onChange({
            ...data,
            viewport: {
                ...data.viewport,
                x: initialViewportRef.current.x + dx,
                y: initialViewportRef.current.y + dy
            }
        });
    }

    if (draggingNodeId && dragStartRef.current && initialNodePosRef.current) {
        const zoom = data.viewport.zoom;
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        
        const newNodes = data.nodes.map(n => {
            if (n.id === draggingNodeId) {
                return {
                    ...n,
                    x: initialNodePosRef.current!.x + dx,
                    y: initialNodePosRef.current!.y + dy
                };
            }
            return n;
        });
        onChange({ ...data, nodes: newNodes });
    }
  }, [isPanning, draggingNodeId, data, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingPin(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(data.viewport.zoom + scaleAmount, 0.2), 3);
    onChange({
        ...data,
        viewport: { ...data.viewport, zoom: newZoom }
    });
  };

  // --- ACTIONS ---

  const handleResetView = () => {
      onChange({
          ...data,
          viewport: { x: 0, y: 0, zoom: 1 }
      });
  };

  const handleZoomIn = () => {
      const newZoom = Math.min(data.viewport.zoom + 0.2, 3);
      onChange({
          ...data,
          viewport: { ...data.viewport, zoom: newZoom }
      });
  };

  const handleZoomOut = () => {
      const newZoom = Math.max(data.viewport.zoom - 0.2, 0.2);
      onChange({
          ...data,
          viewport: { ...data.viewport, zoom: newZoom }
      });
  };

  const createNode = (type: BlueprintNodeType) => {
      // Add to center of viewport
      const cx = (-data.viewport.x + (containerRef.current?.clientWidth || 800)/2) / data.viewport.zoom;
      const cy = (-data.viewport.y + (containerRef.current?.clientHeight || 600)/2) / data.viewport.zoom;
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;

      let newNode: BlueprintNode;

      if (type === BlueprintNodeType.Text) {
          newNode = {
            id: 'text-' + Date.now(),
            type: BlueprintNodeType.Text,
            title: '',
            content: 'Label Text',
            x: cx + offsetX,
            y: cy + offsetY,
            inputs: [],
            outputs: []
          };
      } else if (type === BlueprintNodeType.Arrow) {
          newNode = {
            id: 'arrow-' + Date.now(),
            type: BlueprintNodeType.Arrow,
            title: '',
            content: '',
            x: cx + offsetX,
            y: cy + offsetY,
            rotation: 0,
            inputs: [], // No inputs
            outputs: [] // No outputs
          };
      } else {
        // Default Block
        newNode = {
            id: 'block-' + Date.now(),
            type: BlueprintNodeType.Block,
            title: 'Process',
            content: '',
            x: cx + offsetX,
            y: cy + offsetY,
            inputs: [{ id: 'in', type: 'flow' }],
            outputs: [{ id: 'out-1', name: 'Next', type: 'flow' }]
        };
      }

    onChange({
        ...data,
        nodes: [...data.nodes, newNode]
    });
  };

  const deleteNode = (id: string) => {
    const newNodes = data.nodes.filter(n => n.id !== id);
    const newConnections = data.connections.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id);
    onChange({ ...data, nodes: newNodes, connections: newConnections });
  };

  const rotateNode = (id: string) => {
      onChange({
          ...data,
          nodes: data.nodes.map(n => {
              if (n.id === id && n.type === BlueprintNodeType.Arrow) {
                  const currentRotation = n.rotation || 0;
                  return { ...n, rotation: (currentRotation + 90) % 360 };
              }
              return n;
          })
      });
  };

  const updateNodeTitle = (id: string, newTitle: string) => {
      onChange({
          ...data,
          nodes: data.nodes.map(n => n.id === id ? { ...n, title: newTitle } : n)
      });
  };

  const updateNodeContent = (id: string, newContent: string) => {
    onChange({
        ...data,
        nodes: data.nodes.map(n => n.id === id ? { ...n, content: newContent } : n)
    });
  };

  const addBranch = (nodeId: string) => {
      const node = data.nodes.find(n => n.id === nodeId);
      if (!node) return;
      const newPinId = `out-${Date.now()}`;
      const newOutputs = [...node.outputs, { id: newPinId, name: 'Branch', type: 'flow' as const }];
      
      onChange({
          ...data,
          nodes: data.nodes.map(n => n.id === nodeId ? { ...n, outputs: newOutputs } : n)
      });
  };

  const removeBranch = (nodeId: string, pinId: string) => {
      const node = data.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const newOutputs = node.outputs.filter(p => p.id !== pinId);
      const newNodes = data.nodes.map(n => n.id === nodeId ? { ...n, outputs: newOutputs } : n);
      
      const newConnections = data.connections.filter(c => 
          !(c.sourceNodeId === nodeId && c.sourcePinId === pinId)
      );
      
      onChange({ ...data, nodes: newNodes, connections: newConnections });
  };

  // --- RENDER HELPERS ---
  
  // Layout Constants
  const getPinOffset = (node: BlueprintNode, pinId: string, isInput: boolean) => {
      const nx = node.x;
      const ny = node.y;
      
      if (node.type === BlueprintNodeType.Text) return { x: nx, y: ny };

      if (node.type === BlueprintNodeType.Arrow) {
          // Arrow Dimensions: 180w x 60h (Slimmer now)
          // Pins depend on rotation
          const r = node.rotation || 0;
          const w = 180;
          const h = 60;
          const cx = w/2;
          const cy = h/2;

          // Helper to rotate point (px, py) around center (cx, cy)
          const rotatePoint = (px: number, py: number, angleDeg: number) => {
              const rad = (angleDeg * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              return {
                  x: cx + (px - cx) * cos - (py - cy) * sin,
                  y: cy + (px - cx) * sin + (py - cy) * cos
              };
          };

          // Logical positions at 0 rotation
          // Input at Left Center (0, 30), Output at Right Center (180, 30)
          const rawPoint = isInput ? { x: 0, y: 30 } : { x: 180, y: 30 };
          const rotated = rotatePoint(rawPoint.x, rawPoint.y, r);

          return { x: nx + rotated.x, y: ny + rotated.y };
      }

      // Default Block Layout
      const HEADER_HEIGHT = 32;
      const BODY_HEIGHT = 76; 
      const START_OF_OUTPUTS = HEADER_HEIGHT + BODY_HEIGHT;
      const OUTPUT_ROW_HEIGHT = 28;
      const PIN_OFFSET_Y = 14; 
      const INPUT_PIN_Y = 64; 

      if (isInput) {
          return { x: nx, y: ny + INPUT_PIN_Y }; 
      } else {
          const index = node.outputs.findIndex(p => p.id === pinId);
          if (index === -1) return { x: nx + 200, y: ny + START_OF_OUTPUTS }; 
          return { x: nx + 200, y: ny + START_OF_OUTPUTS + (index * OUTPUT_ROW_HEIGHT) + PIN_OFFSET_Y };
      }
  };

  return (
    <div 
        ref={containerRef}
        className={`w-full h-full bg-[#1e1e1e] overflow-hidden relative select-none ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
    >
        {/* Grid Background */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
                backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                backgroundSize: `${20 * data.viewport.zoom}px ${20 * data.viewport.zoom}px`,
                backgroundPosition: `${data.viewport.x}px ${data.viewport.y}px`
            }}
        />
        
        {/* TRANSFORM CONTAINER */}
        <div 
            className="absolute origin-top-left will-change-transform"
            style={{
                transform: `translate(${data.viewport.x}px, ${data.viewport.y}px) scale(${data.viewport.zoom})`
            }}
        >
            {/* CONNECTIONS LAYER */}
            <svg className="overflow-visible absolute top-0 left-0 pointer-events-none">
                {data.connections.map(conn => {
                    const sourceNode = data.nodes.find(n => n.id === conn.sourceNodeId);
                    const targetNode = data.nodes.find(n => n.id === conn.targetNodeId);
                    if (!sourceNode || !targetNode) return null;

                    const start = getPinOffset(sourceNode, conn.sourcePinId, false);
                    const end = getPinOffset(targetNode, conn.targetPinId, true);

                    const dx = Math.abs(end.x - start.x) * 0.5;
                    const dy = Math.abs(end.y - start.y) * 0.5;
                    // Adjust curve based on relative positions for smoother flow
                    const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

                    return (
                        <path 
                            key={conn.id} 
                            d={d} 
                            stroke="#555" 
                            strokeWidth="2" 
                            fill="none" 
                        />
                    );
                })}
            </svg>

            {/* NODES LAYER */}
            {data.nodes.map(node => {
                
                // --- RENDER TEXT NODE ---
                if (node.type === BlueprintNodeType.Text) {
                    return (
                        <div
                            key={node.id}
                            className="absolute group"
                            style={{ left: node.x, top: node.y }}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        >
                            <div className="flex items-center space-x-2">
                                {/* Drag Handle (Visible on hover) */}
                                <div className="p-1 cursor-grab active:cursor-grabbing text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripHorizontal size={12} />
                                </div>
                                <textarea 
                                    className="bg-transparent text-lg font-bold text-gray-300 resize-none outline-none border border-transparent hover:border-[#444] rounded p-1 overflow-hidden"
                                    value={node.content}
                                    onChange={(e) => updateNodeContent(node.id, e.target.value)}
                                    placeholder="Text Label"
                                    style={{ minWidth: '100px', height: '40px' }}
                                    onMouseDown={e => e.stopPropagation()}
                                    disabled={activeTool === 'pan'}
                                />
                                <button 
                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                }

                // --- RENDER ARROW NODE ---
                if (node.type === BlueprintNodeType.Arrow) {
                    const rot = node.rotation || 0;
                    return (
                        <div
                            key={node.id}
                            className="absolute w-[180px] h-[60px] group drop-shadow-lg"
                            style={{ 
                                left: node.x, 
                                top: node.y,
                                transform: `rotate(${rot}deg)`,
                                transformOrigin: 'center center'
                            }}
                        >
                             {/* Arrow Shape Container using clip-path (Slimmer) */}
                            <div 
                                className={`w-full h-full bg-black flex items-center justify-center relative hover:bg-gray-900 transition-colors ${activeTool === 'pan' ? 'cursor-grab' : 'cursor-grab active:cursor-grabbing'}`}
                                style={{ 
                                    // Slimmer arrow shape
                                    clipPath: 'polygon(0% 25%, 75% 25%, 75% 0%, 100% 50%, 75% 100%, 75% 75%, 0% 75%)'
                                }}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                            >
                                {/* Text Removed as requested */}
                            </div>

                            {/* Pins Removed: Arrow is now purely decorative/visual */}
                            
                            {/* Controls Container */}
                            <div className="absolute top-[-30px] left-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Rotate Handle */}
                                <button 
                                    className="text-gray-400 hover:text-white p-1 bg-[#252526] rounded-full shadow-sm border border-[#3e3e42]" 
                                    onClick={(e) => { e.stopPropagation(); rotateNode(node.id); }}
                                    title="Rotate"
                                >
                                    <RotateCw size={12} />
                                </button>
                                {/* Delete Handle */}
                                <button 
                                    className="text-gray-400 hover:text-red-400 p-1 bg-[#252526] rounded-full shadow-sm border border-[#3e3e42]" 
                                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                }

                // --- RENDER STANDARD BLOCK ---
                return (
                    <div
                        key={node.id}
                        className="absolute w-[200px] bg-[#252526] rounded-md shadow-lg border border-[#444] flex flex-col group"
                        style={{ left: node.x, top: node.y }}
                    >
                        {/* Input Pin */}
                        <div 
                            className="absolute w-3 h-3 bg-gray-400 rounded-full hover:bg-white hover:scale-125 transition-all cursor-pointer border border-[#252526] z-10"
                            style={{ top: '58px', left: '-6px' }}
                            onMouseDown={(e) => handlePinMouseDown(e, node.id, 'in', 'input')}
                            onMouseUp={(e) => handlePinMouseUp(e, node.id, 'in', 'input')}
                        />

                        {/* Header */}
                        <div 
                            className={`h-8 bg-[#333] rounded-t-md flex items-center px-2 border-b border-[#444] relative group/header ${activeTool === 'pan' ? 'cursor-grab' : 'cursor-grab active:cursor-grabbing'}`}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        >
                            <GripHorizontal size={14} className="text-gray-500 mr-2 flex-shrink-0" />
                            <input 
                                className="bg-transparent text-xs font-bold text-gray-200 w-full outline-none placeholder-gray-500"
                                value={node.title}
                                onChange={(e) => updateNodeTitle(node.id, e.target.value)}
                                placeholder="Title"
                                onMouseDown={(e) => e.stopPropagation()}
                                disabled={activeTool === 'pan'}
                            />
                            <button 
                                className="absolute right-1 top-1 text-gray-500 hover:text-red-400 opacity-0 group-hover/header:opacity-100 transition-opacity p-1" 
                                onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-2 bg-[#252526]">
                            <textarea 
                                className="w-full h-[60px] bg-[#1e1e1e] text-xs text-gray-300 p-1 resize-none outline-none border border-[#333] rounded scrollbar-none focus:border-blue-500 transition-colors"
                                value={node.content || ''}
                                onChange={(e) => updateNodeContent(node.id, e.target.value)}
                                placeholder="Description..."
                                onMouseDown={(e) => e.stopPropagation()} 
                                disabled={activeTool === 'pan'}
                            />
                        </div>

                        {/* Outputs */}
                        <div className="bg-[#2a2a2b] pb-2 rounded-b-md flex flex-col border-t border-[#333]">
                            {node.outputs.map((pin) => (
                                <div key={pin.id} className="relative h-[28px] flex items-center justify-end pr-3 group/pin hover:bg-[#333] transition-colors">
                                    <span className="text-[10px] text-gray-400 mr-2 select-none">
                                        {pin.name || 'Branch'}
                                    </span>
                                    <button 
                                        className="mr-2 text-gray-600 hover:text-red-400 opacity-0 group-hover/pin:opacity-100 transition-opacity p-0.5"
                                        onClick={() => removeBranch(node.id, pin.id)}
                                    >
                                        <X size={10} />
                                    </button>
                                    <div 
                                        className="absolute -right-1.5 w-3 h-3 bg-gray-400 rounded-full hover:bg-white hover:scale-125 transition-all cursor-pointer border border-[#252526]"
                                        onMouseDown={(e) => handlePinMouseDown(e, node.id, pin.id, 'output')}
                                        onMouseUp={(e) => handlePinMouseUp(e, node.id, pin.id, 'output')}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-center mt-2 px-2">
                                <button 
                                    onClick={() => addBranch(node.id)}
                                    className="w-full flex items-center justify-center py-1 bg-[#333] hover:bg-[#444] text-gray-400 hover:text-white rounded text-[10px] transition-colors border border-[#444]"
                                >
                                    <Plus size={10} className="mr-1" />
                                    Add Branch
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Connection Drag Line */}
        {connectingPin && (
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-50">
                <path 
                    d={`M ${connectingPin.x} ${connectingPin.y} L ${mousePos.x} ${mousePos.y}`} 
                    stroke="#fff" 
                    strokeWidth="2" 
                    strokeDasharray="4"
                    fill="none" 
                    strokeOpacity="0.5"
                />
            </svg>
        )}

        {/* --- EXPANDED TOOLBAR --- */}
        <div className="absolute top-4 left-4 bg-[#252526] border border-[#3e3e42] p-1.5 rounded shadow-lg flex flex-col space-y-2 z-40">
            <div className="text-[10px] font-bold text-gray-500 px-1 mb-1">ADD</div>
            <button 
                className="flex items-center space-x-2 text-xs font-bold text-gray-200 hover:bg-[#3e3e42] px-3 py-1.5 rounded transition-colors"
                onClick={() => createNode(BlueprintNodeType.Block)}
                title="Add Logic Block"
            >
                <Box size={14} className="text-gray-400" />
                <span>Block</span>
            </button>
            <button 
                className="flex items-center space-x-2 text-xs font-bold text-gray-200 hover:bg-[#3e3e42] px-3 py-1.5 rounded transition-colors"
                onClick={() => createNode(BlueprintNodeType.Arrow)}
                title="Add Directional Arrow"
            >
                <ArrowRight size={14} className="text-blue-400" />
                <span>Arrow</span>
            </button>
            <button 
                className="flex items-center space-x-2 text-xs font-bold text-gray-200 hover:bg-[#3e3e42] px-3 py-1.5 rounded transition-colors"
                onClick={() => createNode(BlueprintNodeType.Text)}
                title="Add Text Label"
            >
                <Type size={14} className="text-yellow-400" />
                <span>Text</span>
            </button>

            <div className="w-full h-[1px] bg-[#3e3e42] my-2" />
            
            <div className="text-[10px] font-bold text-gray-500 px-1 mb-1">TOOLS</div>
            <button 
                onClick={() => setActiveTool('select')} 
                className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-colors ${activeTool === 'select' ? 'bg-[#0078d4] text-white' : 'text-gray-200 hover:bg-[#3e3e42]'}`}
                title="Select Tool (Default)"
            >
                <MousePointer2 size={14} />
                <span>Select</span>
            </button>
            <button 
                onClick={() => setActiveTool('pan')} 
                className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-colors ${activeTool === 'pan' ? 'bg-[#0078d4] text-white' : 'text-gray-200 hover:bg-[#3e3e42]'}`}
                title="Pan Tool (Drag to move view)"
            >
                <Hand size={14} />
                <span>Pan</span>
            </button>
            <div className="grid grid-cols-2 gap-1 px-1">
                 <button onClick={handleZoomIn} className="flex items-center justify-center p-1.5 bg-[#333] hover:bg-[#444] rounded text-gray-300" title="Zoom In">
                    <ZoomIn size={14} />
                 </button>
                 <button onClick={handleZoomOut} className="flex items-center justify-center p-1.5 bg-[#333] hover:bg-[#444] rounded text-gray-300" title="Zoom Out">
                    <ZoomOut size={14} />
                 </button>
            </div>
             <button 
                onClick={handleResetView} 
                className="flex items-center justify-center space-x-2 text-xs font-bold text-gray-200 hover:bg-[#3e3e42] px-3 py-1.5 rounded transition-colors mt-1"
                title="Reset View to Center"
            >
                <Target size={14} className="text-gray-400" />
                <span>Reset View</span>
            </button>
        </div>
    </div>
  );
};
