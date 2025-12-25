
import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { ExplorerNode } from '../types';
import { ClassIcon } from './ClassIcon';

interface ExplorerItemProps {
  node: ExplorerNode;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export const ExplorerItem: React.FC<ExplorerItemProps> = ({ 
  node, 
  depth = 0, 
  selectedId, 
  onSelect,
  onContextMenu
}) => {
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(node.id); // Select on right click too
      onContextMenu(e, node.id);
  };

  return (
    <div className="select-none">
      {/* Node Row */}
      <div 
        className={`
          flex items-center h-6 pr-2 cursor-pointer
          ${isSelected ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#3e3e42] text-[#cccccc]'}
        `}
        style={{ paddingLeft: `${depth * 16 + 4}px` }} // Indentation
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Toggle Arrow */}
        <div className="w-4 h-4 flex items-center justify-center mr-0.5" onClick={hasChildren ? handleToggle : undefined}>
          {hasChildren && (
            isExpanded ? 
              <ChevronDown size={12} className={isSelected ? "text-white" : "text-gray-400"} /> : 
              <ChevronRight size={12} className={isSelected ? "text-white" : "text-gray-400"} />
          )}
        </div>

        {/* Icon */}
        <div className="mr-1.5 flex-shrink-0">
          <ClassIcon className={node.className} />
        </div>

        {/* Name */}
        <span className="text-[13px] truncate leading-none">
          {node.name}
        </span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <ExplorerItem 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              selectedId={selectedId}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};
