
import React, { useState, useEffect, useRef } from 'react';
import { X, GripHorizontal, Scaling, Plus, Trash2, FileText, Save } from 'lucide-react';
import { BlueprintCanvas } from './BlueprintCanvas';
import { BlueprintData, BlueprintFile } from '../types';

interface BlueprintWindowProps {
  isOpen: boolean;
  onClose: () => void;
  files: BlueprintFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onDeleteFile: (id: string) => void;
  onUpdateFile: (id: string, updates: Partial<BlueprintFile>) => void;
  onUpdateData: (data: BlueprintData) => void;
}

export const BlueprintWindow: React.FC<BlueprintWindowProps> = ({ 
  isOpen, onClose, files, activeFileId, onSelectFile, onCreateFile, onDeleteFile, onUpdateFile, onUpdateData
}) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const startSizeRef = useRef<{ w: number; h: number } | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartRef.current && startPosRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
          x: Math.max(0, startPosRef.current.x + dx),
          y: Math.max(0, startPosRef.current.y + dy)
        });
      }
      if (isResizing && dragStartRef.current && startSizeRef.current) {
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
          setSize({
              w: Math.max(400, startSizeRef.current.w + dx),
              h: Math.max(300, startSizeRef.current.h + dy)
          });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50 flex flex-col bg-[#252526] border border-[#3e3e42] shadow-2xl rounded-sm overflow-hidden"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.w, 
        height: size.h 
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="h-[28px] bg-[#2d2d2d] border-b border-[#1e1e1e] flex items-center justify-between px-2 cursor-move select-none"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragStartRef.current = { x: e.clientX, y: e.clientY };
          startPosRef.current = { ...position };
        }}
      >
        <div className="flex items-center text-gray-400 space-x-2">
            <GripHorizontal size={14} />
            <span className="text-xs font-bold text-gray-300">Blueprint Editor</span>
        </div>
        <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-red-600 rounded p-0.5 transition-colors"
            onMouseDown={e => e.stopPropagation()} 
        >
            <X size={14} />
        </button>
      </div>

      {/* Toolbar / File Manager */}
      <div className="h-[32px] bg-[#333333] border-b border-[#1e1e1e] flex items-center px-2 space-x-2 select-none">
        
        {/* File Selector */}
        <div className="flex items-center space-x-2 bg-[#252526] border border-[#3e3e42] rounded px-2 py-0.5">
           <FileText size={12} className="text-blue-400" />
           <select 
             className="bg-transparent text-xs text-gray-300 outline-none w-[150px] cursor-pointer"
             value={activeFileId || ''}
             onChange={(e) => onSelectFile(e.target.value)}
           >
             {files.length === 0 && <option value="">No Blueprints</option>}
             {files.map(f => (
               <option key={f.id} value={f.id}>{f.name}</option>
             ))}
           </select>
        </div>

        {/* Rename Input */}
        {activeFile && (
           <input 
             type="text" 
             value={activeFile.name}
             onChange={(e) => onUpdateFile(activeFile.id, { name: e.target.value })}
             className="bg-[#252526] border border-[#3e3e42] text-xs text-gray-300 px-2 py-0.5 rounded outline-none w-[120px] focus:border-blue-500"
             placeholder="Blueprint Name"
           />
        )}

        <div className="w-[1px] h-[16px] bg-[#444] mx-1" />

        {/* Actions */}
        <button 
           onClick={onCreateFile}
           className="flex items-center space-x-1 px-2 py-1 bg-[#252526] hover:bg-[#3e3e42] border border-[#3e3e42] rounded text-xs text-gray-300 transition-colors"
           title="Create New Blueprint"
        >
           <Plus size={12} />
           <span>New</span>
        </button>

        <button 
           onClick={() => activeFileId && onDeleteFile(activeFileId)}
           disabled={!activeFileId}
           className={`flex items-center space-x-1 px-2 py-1 bg-[#252526] border border-[#3e3e42] rounded text-xs transition-colors
             ${activeFileId ? 'hover:bg-red-900/50 hover:border-red-800 text-gray-300' : 'opacity-50 cursor-not-allowed text-gray-500'}
           `}
           title="Delete Blueprint"
        >
           <Trash2 size={12} />
           <span>Delete</span>
        </button>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
          {activeFile ? (
            <BlueprintCanvas 
                key={activeFile.id} // Force remount on file change to reset viewport/state
                data={activeFile.content}
                onChange={onUpdateData}
            />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                 <div className="p-4 bg-[#252526] rounded-full border border-[#3e3e42]">
                     <FileText size={48} className="opacity-20" />
                 </div>
                 <div className="text-center">
                     <p className="text-sm font-bold mb-1">No Blueprint Selected</p>
                     <p className="text-xs opacity-70 mb-4">Create a new blueprint to start building logic.</p>
                     <button 
                        onClick={onCreateFile}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-bold transition-colors"
                     >
                        Create Blueprint
                     </button>
                 </div>
             </div>
          )}
          
          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 p-0.5 cursor-se-resize text-gray-500 hover:text-white z-10"
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                dragStartRef.current = { x: e.clientX, y: e.clientY };
                startSizeRef.current = { ...size };
            }}
          >
              <Scaling size={12} className="transform rotate-90" />
          </div>
      </div>
    </div>
  );
};
