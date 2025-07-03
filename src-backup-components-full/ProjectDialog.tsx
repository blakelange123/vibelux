'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Cloud, Trash2 } from 'lucide-react';
import { ProjectManager, type LightingProject } from '@/lib/project-manager';
import { useAuth } from '@clerk/nextjs';

interface ProjectDialogProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  currentProject?: Partial<LightingProject>;
  onClose: () => void;
  onSave?: (project: LightingProject) => void;
  onLoad?: (project: LightingProject) => void;
}

export function ProjectDialog({ 
  isOpen, 
  mode, 
  currentProject,
  onClose, 
  onSave, 
  onLoad 
}: ProjectDialogProps) {
  const { userId } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState<LightingProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'load' && userId) {
      loadProjects();
    }
  }, [isOpen, mode, userId]);

  const loadProjects = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userProjects = await ProjectManager.listProjects(userId);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !projectName || !currentProject) return;

    setLoading(true);
    try {
      const project: Omit<LightingProject, 'id' | 'metadata'> = {
        user_id: userId,
        name: projectName,
        description: projectDescription,
        room_dimensions: currentProject.room_dimensions || { width: 10, length: 10, height: 3 },
        objects: currentProject.objects || [],
        dimming_levels: currentProject.dimming_levels || {},
        calculation_settings: currentProject.calculation_settings || {
          grid_size: 0.5,
          calculation_height: 0.9,
          reflection_factors: {
            ceiling: 0.8,
            walls: 0.5,
            floor: 0.2
          }
        }
      };

      const projectId = await ProjectManager.saveProject(project);
      
      if (onSave) {
        onSave({ ...project, id: projectId } as LightingProject);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const project = await ProjectManager.loadProject(selectedProject);
      if (onLoad) {
        onLoad(project);
      }
      onClose();
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await ProjectManager.deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {mode === 'save' ? <Save className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
            {mode === 'save' ? 'Save Project' : 'Load Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {mode === 'save' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
                  placeholder="Enter project name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
                  rows={3}
                  placeholder="Enter project description..."
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Project Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Objects:</span>
                    <span className="text-white">{currentProject?.objects?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room Size:</span>
                    <span className="text-white">
                      {currentProject?.room_dimensions ? 
                        `${currentProject.room_dimensions.width}m × ${currentProject.room_dimensions.length}m` : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-gray-400">
                    <Cloud className="w-5 h-5 animate-pulse" />
                    Loading projects...
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No saved projects found
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project.id || null)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedProject === project.id
                          ? 'bg-purple-900 border-purple-600'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{project.objects.length} objects</span>
                            <span>
                              {new Date(project.metadata.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id!);
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'save' ? handleSave : handleLoad}
            disabled={loading || (mode === 'save' ? !projectName : !selectedProject)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : mode === 'save' ? 'Save Project' : 'Load Project'}
          </button>
        </div>
      </div>
    </div>
  );
}