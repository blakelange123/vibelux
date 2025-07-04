'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Copy, 
  Trash2, 
  RotateCw, 
  Move, 
  Settings,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  BringToFront,
  SendToBack,
  Group,
  Ungroup,
  Ruler,
  Info,
  Download,
  Upload
} from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
  action?: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  // Adjust position to keep menu on screen
  useEffect(() => {
    if (!menuRef.current) return;
    
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Check right edge
    if (x + rect.width > window.innerWidth - padding) {
      adjustedX = window.innerWidth - rect.width - padding;
    }
    
    // Check bottom edge
    if (y + rect.height > window.innerHeight - padding) {
      adjustedY = window.innerHeight - rect.height - padding;
    }
    
    // Check left edge
    if (adjustedX < padding) {
      adjustedX = padding;
    }
    
    // Check top edge
    if (adjustedY < padding) {
      adjustedY = padding;
    }
    
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;
    
    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      item.action?.();
      onClose();
    }
  };
  
  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="h-px bg-gray-700 my-1" />;
    }
    
    const isActive = activeSubmenu === item.id;
    
    return (
      <div key={item.id || index} className="relative">
        <button
          className={`
            w-full px-3 py-2 text-sm text-left flex items-center justify-between
            transition-colors duration-150
            ${item.disabled 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }
            ${isActive ? 'bg-gray-700 text-white' : ''}
          `}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
        >
          <div className="flex items-center gap-2">
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {item.shortcut && (
              <span className="text-xs text-gray-500">{item.shortcut}</span>
            )}
            {item.submenu && (
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </button>
        
        {/* Submenu */}
        {item.submenu && isActive && (
          <div className="absolute left-full top-0 ml-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]">
              {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[200px]"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
}

// Context menu builder for common operations
export class ContextMenuBuilder {
  static objectMenu(options: {
    selectedCount: number;
    canCopy?: boolean;
    canDelete?: boolean;
    canRotate?: boolean;
    canMove?: boolean;
    isLocked?: boolean;
    isVisible?: boolean;
    onCopy?: () => void;
    onDelete?: () => void;
    onRotate?: () => void;
    onMove?: () => void;
    onLock?: () => void;
    onToggleVisibility?: () => void;
    onProperties?: () => void;
    onGroup?: () => void;
    onUngroup?: () => void;
    onBringToFront?: () => void;
    onSendToBack?: () => void;
    onFlipHorizontal?: () => void;
    onFlipVertical?: () => void;
    onMeasure?: () => void;
    onExport?: () => void;
  }): ContextMenuItem[] {
    const items: ContextMenuItem[] = [];
    
    // Basic operations
    if (options.selectedCount > 0) {
      items.push({
        id: 'copy',
        label: 'Copy',
        icon: <Copy className="w-4 h-4" />,
        shortcut: 'Ctrl+C',
        disabled: !options.canCopy,
        action: options.onCopy
      });
      
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        shortcut: 'Del',
        disabled: !options.canDelete,
        action: options.onDelete
      });
      
      items.push({ separator: true });
      
      // Transform operations
      items.push({
        id: 'transform',
        label: 'Transform',
        icon: <Move className="w-4 h-4" />,
        submenu: [
          {
            id: 'move',
            label: 'Move',
            icon: <Move className="w-4 h-4" />,
            shortcut: 'M',
            disabled: !options.canMove,
            action: options.onMove
          },
          {
            id: 'rotate',
            label: 'Rotate',
            icon: <RotateCw className="w-4 h-4" />,
            shortcut: 'R',
            disabled: !options.canRotate,
            action: options.onRotate
          },
          { separator: true },
          {
            id: 'flip-horizontal',
            label: 'Flip Horizontal',
            icon: <FlipHorizontal className="w-4 h-4" />,
            action: options.onFlipHorizontal
          },
          {
            id: 'flip-vertical',
            label: 'Flip Vertical',
            icon: <FlipVertical className="w-4 h-4" />,
            action: options.onFlipVertical
          }
        ]
      });
      
      // Layer operations
      items.push({
        id: 'arrange',
        label: 'Arrange',
        icon: <Layers className="w-4 h-4" />,
        submenu: [
          {
            id: 'bring-to-front',
            label: 'Bring to Front',
            icon: <BringToFront className="w-4 h-4" />,
            shortcut: 'Ctrl+]',
            action: options.onBringToFront
          },
          {
            id: 'send-to-back',
            label: 'Send to Back',
            icon: <SendToBack className="w-4 h-4" />,
            shortcut: 'Ctrl+[',
            action: options.onSendToBack
          }
        ]
      });
      
      items.push({ separator: true });
      
      // Grouping
      if (options.selectedCount > 1) {
        items.push({
          id: 'group',
          label: 'Group',
          icon: <Group className="w-4 h-4" />,
          shortcut: 'Ctrl+G',
          action: options.onGroup
        });
      } else {
        items.push({
          id: 'ungroup',
          label: 'Ungroup',
          icon: <Ungroup className="w-4 h-4" />,
          shortcut: 'Ctrl+Shift+G',
          action: options.onUngroup
        });
      }
      
      items.push({ separator: true });
      
      // Lock/Unlock
      items.push({
        id: 'lock',
        label: options.isLocked ? 'Unlock' : 'Lock',
        icon: options.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
        shortcut: 'Ctrl+L',
        action: options.onLock
      });
      
      // Visibility
      items.push({
        id: 'visibility',
        label: options.isVisible ? 'Hide' : 'Show',
        icon: options.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
        shortcut: 'Ctrl+H',
        action: options.onToggleVisibility
      });
      
      items.push({ separator: true });
      
      // Tools
      items.push({
        id: 'measure',
        label: 'Measure',
        icon: <Ruler className="w-4 h-4" />,
        action: options.onMeasure
      });
      
      items.push({
        id: 'properties',
        label: 'Properties',
        icon: <Settings className="w-4 h-4" />,
        shortcut: 'Ctrl+I',
        action: options.onProperties
      });
      
      items.push({ separator: true });
      
      // Export
      items.push({
        id: 'export',
        label: 'Export Selection',
        icon: <Download className="w-4 h-4" />,
        action: options.onExport
      });
    }
    
    return items;
  }
  
  static canvasMenu(options: {
    canPaste?: boolean;
    canSelectAll?: boolean;
    onPaste?: () => void;
    onSelectAll?: () => void;
    onAddFixture?: () => void;
    onAddEquipment?: () => void;
    onAddShape?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomFit?: () => void;
    onToggleGrid?: () => void;
    onToggleSnap?: () => void;
    onImport?: () => void;
  }): ContextMenuItem[] {
    const items: ContextMenuItem[] = [];
    
    // Paste
    items.push({
      id: 'paste',
      label: 'Paste',
      icon: <Copy className="w-4 h-4" />,
      shortcut: 'Ctrl+V',
      disabled: !options.canPaste,
      action: options.onPaste
    });
    
    items.push({
      id: 'select-all',
      label: 'Select All',
      shortcut: 'Ctrl+A',
      disabled: !options.canSelectAll,
      action: options.onSelectAll
    });
    
    items.push({ separator: true });
    
    // Add objects
    items.push({
      id: 'add',
      label: 'Add',
      submenu: [
        {
          id: 'add-fixture',
          label: 'Fixture',
          action: options.onAddFixture
        },
        {
          id: 'add-equipment',
          label: 'Equipment',
          action: options.onAddEquipment
        },
        {
          id: 'add-shape',
          label: 'Shape',
          action: options.onAddShape
        }
      ]
    });
    
    items.push({ separator: true });
    
    // View options
    items.push({
      id: 'view',
      label: 'View',
      submenu: [
        {
          id: 'zoom-in',
          label: 'Zoom In',
          shortcut: 'Ctrl++',
          action: options.onZoomIn
        },
        {
          id: 'zoom-out',
          label: 'Zoom Out',
          shortcut: 'Ctrl+-',
          action: options.onZoomOut
        },
        {
          id: 'zoom-fit',
          label: 'Fit to Screen',
          shortcut: 'Ctrl+0',
          action: options.onZoomFit
        },
        { separator: true },
        {
          id: 'toggle-grid',
          label: 'Toggle Grid',
          shortcut: 'G',
          action: options.onToggleGrid
        },
        {
          id: 'toggle-snap',
          label: 'Toggle Snap',
          shortcut: 'S',
          action: options.onToggleSnap
        }
      ]
    });
    
    items.push({ separator: true });
    
    // Import
    items.push({
      id: 'import',
      label: 'Import',
      icon: <Upload className="w-4 h-4" />,
      action: options.onImport
    });
    
    return items;
  }
}