
import React from 'react';
import { Layers, SlidersHorizontal, Bot, Map, Hammer } from 'lucide-react';

interface TopBarProps {
  showExplorer: boolean;
  onToggleExplorer: () => void;
  showProperties: boolean;
  onToggleProperties: () => void;
  showAssistant: boolean;
  onToggleAssistant: () => void;
  showBlueprint: boolean;
  onToggleBlueprint: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  showExplorer, 
  onToggleExplorer, 
  showProperties, 
  onToggleProperties,
  showAssistant,
  onToggleAssistant,
  showBlueprint,
  onToggleBlueprint
}) => {
  return (
    <div className="bg-[#2d2d2d] border-b border-[#1e1e1e] flex flex-col select-none z-30 relative">
        {/* Ribbon Toolbar */}
        <div className="h-[44px] bg-[#3e3e42] flex items-center px-2 space-x-2 border-b border-[#1e1e1e] shadow-sm justify-between">
            
            {/* Left: Branding */}
            <div className="flex items-center px-2 select-none pointer-events-none opacity-90">
                <div className="w-6 h-6 bg-[#0078d4] rounded mr-2 flex items-center justify-center shadow-sm">
                    <Hammer size={14} className="text-white" />
                </div>
                <span className="font-bold text-gray-200 text-sm tracking-wide font-sans">ScriptBlox Studio</span>
            </div>

            {/* Right Controls - Unified View Toggles */}
            <div className="flex items-center space-x-1">
                
                {/* Explorer Toggle */}
                <button 
                    onClick={onToggleExplorer}
                    className={`
                        flex flex-col items-center justify-center px-3 py-1 rounded transition-colors h-[36px] min-w-[50px]
                        ${showExplorer ? 'bg-[#505055] border border-[#666] shadow-inner' : 'hover:bg-[#505055] border border-transparent'}
                    `}
                    title="Toggle Explorer"
                >
                    <Layers size={16} className={showExplorer ? "text-white" : "text-gray-300"} />
                    <span className="text-[10px] mt-0.5 text-gray-200">Explorer</span>
                </button>

                {/* Properties Toggle */}
                <button 
                    onClick={onToggleProperties}
                    className={`
                        flex flex-col items-center justify-center px-3 py-1 rounded transition-colors h-[36px] min-w-[50px]
                        ${showProperties ? 'bg-[#505055] border border-[#666] shadow-inner' : 'hover:bg-[#505055] border border-transparent'}
                    `}
                    title="Toggle Properties"
                >
                    <SlidersHorizontal size={16} className={showProperties ? "text-white" : "text-gray-300"} />
                    <span className="text-[10px] mt-0.5 text-gray-200">Properties</span>
                </button>

                <div className="w-[1px] h-[24px] bg-[#555] mx-1" />

                 {/* Blueprint Toggle */}
                <button 
                    onClick={onToggleBlueprint}
                    className={`
                        flex flex-col items-center justify-center px-3 py-1 rounded transition-colors h-[36px] min-w-[50px]
                        ${showBlueprint ? 'bg-[#505055] border border-[#666] shadow-inner' : 'hover:bg-[#505055] border border-transparent'}
                    `}
                    title="Toggle Blueprint"
                >
                    <Map size={16} className={showBlueprint ? "text-purple-400" : "text-gray-300"} />
                    <span className="text-[10px] mt-0.5 text-gray-200">Blueprint</span>
                </button>

                 {/* Assistant Toggle */}
                <button 
                    onClick={onToggleAssistant}
                    className={`
                        flex flex-col items-center justify-center px-3 py-1 rounded transition-colors h-[36px] min-w-[50px]
                        ${showAssistant ? 'bg-[#505055] border border-[#666] shadow-inner' : 'hover:bg-[#505055] border border-transparent'}
                    `}
                    title="Toggle AI Assistant"
                >
                    <Bot size={16} className={showAssistant ? "text-blue-400" : "text-gray-300"} />
                    <span className="text-[10px] mt-0.5 text-gray-200">Assistant</span>
                </button>
            </div>
        </div>
    </div>
  );
};
