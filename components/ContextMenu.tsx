
import React, { useEffect, useRef } from 'react';

interface ContextMenuAction {
    label: string;
    onClick: () => void;
    shortcut?: string;
    danger?: boolean;
    disabled?: boolean;
    separator?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    actions: ContextMenuAction[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, actions }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleScroll = () => onClose();
        
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    // Ensure menu stays within viewport
    const style: React.CSSProperties = {
        top: y,
        left: x,
    };

    if (typeof window !== 'undefined') {
        if (y + 300 > window.innerHeight) style.top = y - (actions.length * 30); // Flip up if near bottom
        if (x + 200 > window.innerWidth) style.left = x - 200; // Flip left if near right edge
    }

    return (
        <div 
            ref={ref}
            className="fixed z-50 bg-[#252526] border border-[#3e3e42] shadow-xl rounded-sm py-1 min-w-[180px] select-none"
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {actions.map((action, i) => (
                <React.Fragment key={i}>
                    {action.separator ? (
                        <div className="h-[1px] bg-[#3e3e42] my-1 mx-2" />
                    ) : (
                        <button 
                            className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between group transition-colors
                                ${action.danger ? 'text-red-400 hover:bg-red-900/30' : 'text-gray-200 hover:bg-[#094771] hover:text-white'}
                                ${action.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500' : ''}
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!action.disabled) {
                                    action.onClick();
                                    onClose();
                                }
                            }}
                        >
                            <span>{action.label}</span>
                            {action.shortcut && <span className="text-gray-500 group-hover:text-gray-300 ml-4 opacity-70">{action.shortcut}</span>}
                        </button>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
