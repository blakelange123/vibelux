import { useState, useEffect } from 'react';

export function useCollaboration() {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addCollaborator = (collaborator: any) => {
    setCollaborators([...collaborators, collaborator]);
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  return {
    collaborators,
    isLoading,
    addCollaborator,
    removeCollaborator
  };
}