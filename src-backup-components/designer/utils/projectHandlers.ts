import type { DesignerState } from '../context/types';

const PROJECT_STORAGE_KEY = 'vibelux_designer_project';
const RECENT_PROJECTS_KEY = 'vibelux_recent_projects';

export interface Project {
  id: string;
  name: string;
  state: Partial<DesignerState>;
  createdAt: string;
  updatedAt: string;
}

export function saveProject(state: DesignerState, projectName?: string): Project {
  const project: Project = {
    id: `project-${Date.now()}`,
    name: projectName || `Project ${new Date().toLocaleDateString()}`,
    state: {
      room: state.room,
      objects: state.objects,
      ui: {
        ...state.ui,
        panels: { ...state.ui.panels } // Reset panels
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to localStorage
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
  
  // Update recent projects
  const recentProjects = getRecentProjects();
  const updated = [project, ...recentProjects.filter(p => p.id !== project.id)].slice(0, 10);
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
  
  return project;
}

export function loadProject(projectId: string): Project | null {
  const recentProjects = getRecentProjects();
  return recentProjects.find(p => p.id === projectId) || null;
}

export function getRecentProjects(): Project[] {
  try {
    const stored = localStorage.getItem(RECENT_PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function deleteProject(projectId: string) {
  const recentProjects = getRecentProjects();
  const updated = recentProjects.filter(p => p.id !== projectId);
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
}

export function exportProject(state: DesignerState) {
  const project = saveProject(state);
  
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vibelux-project-${project.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;
        // Update timestamps
        project.updatedAt = new Date().toISOString();
        
        // Save to recent projects
        const recentProjects = getRecentProjects();
        const updated = [project, ...recentProjects.filter(p => p.id !== project.id)].slice(0, 10);
        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
        
        resolve(project);
      } catch (error) {
        reject(new Error('Invalid project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}