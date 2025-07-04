'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  Edit2,
  Layers,
  Square,
  Circle,
  Lightbulb,
  Trees,
  Package,
  Grid3x3,
  Search,
  Filter,
  FolderPlus,
  Folder,
  FolderOpen,
  Copy,
  Move3D,
  Sliders,
  MoreHorizontal
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import type { RoomObject } from '../context/types';

interface LayerItemProps {
  object: RoomObject;
  index: number;
  total: number;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function LayerItem({
  object,
  index,
  total,
  onMove,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  isSelected,
  onSelect
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(object.customName || `${object.type} ${index + 1}`);
  
  // Get appropriate icon for object type
  const getIcon = () => {
    switch (object.type) {
      case 'fixture': return <Lightbulb className="w-4 h-4" />;
      case 'plant': return <Trees className="w-4 h-4" />;
      case 'rack': return <Grid3x3 className="w-4 h-4" />;
      case 'obstacle': return <Square className="w-4 h-4" />;
      case 'wall': return <Square className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };
  
  const handleRename = () => {
    onRename(object.id, editName);
    setIsEditing(false);
  };
  
  // Check if object is locked (we'll add this property later)
  const isLocked = (object as any).locked || false;
  
  return (
    <div 
      className={`group flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors ${
        isSelected ? 'bg-purple-600/20 border-l-2 border-purple-500' : ''
      }`}
      onClick={() => onSelect(object.id)}
    >
      {/* Icon */}
      <div className="text-gray-400">
        {getIcon()}
      </div>
      
      {/* Name */}
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          className="flex-1 bg-gray-700 px-2 py-1 rounded text-sm"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm text-gray-200 truncate">
          {object.customName || `${object.type} ${index + 1}`}
        </span>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Edit name */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-600 rounded"
          title="Rename"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        
        {/* Visibility */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(object.id);
          }}
          className="p-1 hover:bg-gray-600 rounded"
          title={object.enabled ? "Hide" : "Show"}
        >
          {object.enabled ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3 text-gray-500" />
          )}
        </button>
        
        {/* Lock */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(object.id);
          }}
          className="p-1 hover:bg-gray-600 rounded"
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? (
            <Lock className="w-3 h-3 text-orange-400" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </button>
        
        {/* Move up */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(object.id, 'up');
          }}
          className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
          disabled={index === 0}
          title="Move up"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        
        {/* Move down */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(object.id, 'down');
          }}
          className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
          disabled={index === total - 1}
          title="Move down"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const duplicated = {
              ...object,
              id: `${object.type}_${Date.now()}`,
              x: object.x + 2,
              y: object.y + 2,
              customName: object.customName ? `${object.customName} Copy` : undefined
            };
            // Add to the same context
            window.dispatchEvent(new CustomEvent('duplicateObject', { detail: duplicated }));
          }}
          className="p-1 hover:bg-blue-600 rounded"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this object?')) {
              onDelete(object.id);
            }
          }}
          className="p-1 hover:bg-red-600 rounded"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function LayersPanel() {
  const { state, dispatch, updateObject, deleteObject, selectObject } = useDesigner();
  const { objects, ui } = state;
  
  // Enhanced state for new features
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGroups, setShowGroups] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['fixture', 'plant', 'rack', 'obstacle', 'wall']) // Expand all groups by default
  );
  const [draggedObject, setDraggedObject] = useState<string | null>(null);
  
  // Filter and search objects
  const filteredObjects = objects.filter(obj => {
    const matchesSearch = searchTerm === '' || 
      (obj.customName || obj.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || obj.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Reverse objects array to show newest on top (like Photoshop)
  const reversedObjects = [...filteredObjects].reverse();
  
  // Get unique object types for filter dropdown
  const objectTypes = Array.from(new Set(objects.map(obj => obj.type)));
  
  // Group objects by type for better organization
  const groupedObjects = reversedObjects.reduce((groups, obj) => {
    const type = obj.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(obj);
    return groups;
  }, {} as Record<string, typeof reversedObjects>);
  
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const currentIndex = objects.findIndex(obj => obj.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' 
      ? Math.min(currentIndex + 1, objects.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    if (newIndex === currentIndex) return;
    
    // Reorder objects array
    const newObjects = [...objects];
    const [movedObject] = newObjects.splice(currentIndex, 1);
    newObjects.splice(newIndex, 0, movedObject);
    
    // Update state with new order
    dispatch({ 
      type: 'LOAD_PROJECT', 
      payload: { 
        ...state, 
        objects: newObjects 
      } 
    });
  };
  
  const handleToggleVisibility = (id: string) => {
    const object = objects.find(obj => obj.id === id);
    if (object) {
      updateObject(id, { enabled: !object.enabled });
    }
  };
  
  const handleToggleLock = (id: string) => {
    const object = objects.find(obj => obj.id === id);
    if (object) {
      updateObject(id, { locked: !(object as any).locked });
    }
  };
  
  const handleRename = (id: string, name: string) => {
    updateObject(id, { customName: name });
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, objectId: string) => {
    setDraggedObject(objectId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedObject || draggedObject === targetId) return;
    
    const draggedIndex = objects.findIndex(obj => obj.id === draggedObject);
    const targetIndex = objects.findIndex(obj => obj.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newObjects = [...objects];
    const [movedObject] = newObjects.splice(draggedIndex, 1);
    newObjects.splice(targetIndex, 0, movedObject);
    
    dispatch({ 
      type: 'LOAD_PROJECT', 
      payload: { 
        ...state, 
        objects: newObjects 
      } 
    });
    
    setDraggedObject(null);
  };
  
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };
  
  // Bulk operations
  const hideAllOfType = (type: string) => {
    objects.filter(obj => obj.type === type).forEach(obj => {
      updateObject(obj.id, { enabled: false });
    });
  };
  
  const showAllOfType = (type: string) => {
    objects.filter(obj => obj.type === type).forEach(obj => {
      updateObject(obj.id, { enabled: true });
    });
  };
  
  const duplicateObject = (object: RoomObject) => {
    const duplicated = {
      ...object,
      id: `${object.type}_${Date.now()}`,
      x: object.x + 2,
      y: object.y + 2,
      customName: object.customName ? `${object.customName} Copy` : undefined
    };
    dispatch({ type: 'ADD_OBJECT', payload: duplicated });
  };
  
  // Listen for duplicate object events
  React.useEffect(() => {
    const handleDuplicateObject = (e: CustomEvent) => {
      dispatch({ type: 'ADD_OBJECT', payload: e.detail });
    };
    
    window.addEventListener('duplicateObject', handleDuplicateObject as EventListener);
    return () => {
      window.removeEventListener('duplicateObject', handleDuplicateObject as EventListener);
    };
  }, [dispatch]);
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Layers</h2>
          <span className="text-sm text-gray-400 ml-auto">{objects.length} objects</span>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        
        {/* Filter and Group Controls */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            {objectTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowGroups(!showGroups)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              showGroups 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={showGroups ? "Hide groups" : "Show groups"}
          >
            <Folder className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Layers list */}
      <div className="flex-1 overflow-y-auto">
        {reversedObjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No objects in the scene</p>
            <p className="text-xs mt-1">Add fixtures, obstacles, or other objects to see them here</p>
          </div>
        ) : showGroups ? (
          // Grouped view
          Object.entries(groupedObjects).map(([groupName, groupObjects]) => {
            const isExpanded = expandedGroups.has(groupName);
            const GroupIcon = groupName === 'fixture' ? Lightbulb : 
                             groupName === 'plant' ? Trees : 
                             groupName === 'rack' ? Grid3x3 : Package;
            
            return (
              <div key={groupName} className="border-b border-gray-700/50 last:border-b-0">
                {/* Group Header */}
                <div 
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => toggleGroup(groupName)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                    <GroupIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      {groupName.charAt(0).toUpperCase() + groupName.slice(1)}s
                    </span>
                    <span className="text-xs text-gray-400">({groupObjects.length})</span>
                  </div>
                  
                  {/* Group Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const allVisible = groupObjects.every(obj => obj.enabled);
                        if (allVisible) {
                          hideAllOfType(groupName);
                        } else {
                          showAllOfType(groupName);
                        }
                      }}
                      className="p-1 hover:bg-gray-600 rounded"
                      title={groupObjects.every(obj => obj.enabled) ? "Hide all" : "Show all"}
                    >
                      {groupObjects.every(obj => obj.enabled) ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Group Objects */}
                {isExpanded && (
                  <div className="pl-4">
                    {groupObjects.map((object, index) => (
                      <div
                        key={object.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, object.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, object.id)}
                        className={`${draggedObject === object.id ? 'opacity-50' : ''}`}
                      >
                        <LayerItem
                          object={object}
                          index={filteredObjects.length - 1 - filteredObjects.findIndex(o => o.id === object.id)}
                          total={filteredObjects.length}
                          onMove={handleMove}
                          onToggleVisibility={handleToggleVisibility}
                          onToggleLock={handleToggleLock}
                          onDelete={deleteObject}
                          onRename={handleRename}
                          isSelected={ui.selectedObjectId === object.id}
                          onSelect={selectObject}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Flat view
          reversedObjects.map((object, index) => (
            <div
              key={object.id}
              draggable
              onDragStart={(e) => handleDragStart(e, object.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, object.id)}
              className={`${draggedObject === object.id ? 'opacity-50' : ''}`}
            >
              <LayerItem
                object={object}
                index={filteredObjects.length - 1 - index}
                total={filteredObjects.length}
                onMove={handleMove}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onDelete={deleteObject}
                onRename={handleRename}
                isSelected={ui.selectedObjectId === object.id}
                onSelect={selectObject}
              />
            </div>
          ))
        )}
      </div>
      
      {/* Footer actions */}
      <div className="p-3 border-t border-gray-700 space-y-3">
        {/* Selection and Bulk Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Select all visible objects
              const visibleIds = filteredObjects.map(obj => obj.id);
              dispatch({ type: 'SELECT_OBJECTS', payload: visibleIds });
            }}
            className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            title="Select all visible objects"
          >
            Select All
          </button>
          <button
            onClick={() => {
              // Clear selection
              dispatch({ type: 'CLEAR_SELECTION' });
            }}
            className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Deselect
          </button>
        </div>
        
        {/* Bulk Operations */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              filteredObjects.forEach(obj => updateObject(obj.id, { enabled: true }));
            }}
            className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
            title="Show all filtered objects"
          >
            <Eye className="w-3 h-3 mx-auto" />
          </button>
          <button
            onClick={() => {
              filteredObjects.forEach(obj => updateObject(obj.id, { enabled: false }));
            }}
            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors"
            title="Hide all filtered objects"
          >
            <EyeOff className="w-3 h-3 mx-auto" />
          </button>
          <button
            onClick={() => {
              filteredObjects.forEach(obj => updateObject(obj.id, { locked: true }));
            }}
            className="flex-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors"
            title="Lock all filtered objects"
          >
            <Lock className="w-3 h-3 mx-auto" />
          </button>
          <button
            onClick={() => {
              filteredObjects.forEach(obj => updateObject(obj.id, { locked: false }));
            }}
            className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
            title="Unlock all filtered objects"
          >
            <Unlock className="w-3 h-3 mx-auto" />
          </button>
        </div>
        
        {/* Layer Statistics */}
        <div className="text-xs text-gray-400 flex justify-between">
          <span>Visible: {filteredObjects.filter(obj => obj.enabled).length}</span>
          <span>Hidden: {filteredObjects.filter(obj => !obj.enabled).length}</span>
          <span>Locked: {filteredObjects.filter(obj => (obj as any).locked).length}</span>
        </div>
      </div>
    </div>
  );
}