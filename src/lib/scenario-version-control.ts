/**
 * Version Control System for Lighting Scenarios
 * Provides Git-like functionality for tracking lighting design changes
 */

import { createHash } from 'crypto';

interface LightingScenario {
  id: string;
  name: string;
  description: string;
  fixtures: Array<{
    id: string;
    model: string;
    position: { x: number; y: number; z: number };
    ppfd: number;
    spectrum: Record<string, number>;
  }>;
  roomConfig: {
    width: number;
    length: number;
    height: number;
    reflectivity: number;
  };
  metrics: {
    totalPPFD: number;
    uniformity: number;
    energyCost: number;
    dli: number;
  };
}

interface Version {
  id: string;
  parentId: string | null;
  timestamp: Date;
  author: string;
  message: string;
  checksum: string;
  scenario: LightingScenario;
  diff?: VersionDiff;
}

interface VersionDiff {
  added: {
    fixtures: string[];
    properties: Record<string, any>;
  };
  removed: {
    fixtures: string[];
    properties: Record<string, any>;
  };
  modified: {
    fixtures: Array<{
      id: string;
      changes: Record<string, { old: any; new: any }>;
    }>;
    roomConfig?: Record<string, { old: any; new: any }>;
  };
}

interface Branch {
  name: string;
  headVersionId: string;
  created: Date;
  description: string;
}

export class ScenarioVersionControl {
  private versions: Map<string, Version> = new Map();
  private branches: Map<string, Branch> = new Map();
  private currentBranch: string = 'main';
  private tags: Map<string, string> = new Map(); // tag name -> version id
  
  constructor() {
    // Initialize main branch
    this.branches.set('main', {
      name: 'main',
      headVersionId: '',
      created: new Date(),
      description: 'Main development branch'
    });
  }
  
  /**
   * Create a new version (commit)
   */
  commit(
    scenario: LightingScenario,
    message: string,
    author: string = 'System'
  ): Version {
    const parentId = this.getCurrentHead();
    const checksum = this.calculateChecksum(scenario);
    
    // Check if content has changed
    if (parentId) {
      const parent = this.versions.get(parentId);
      if (parent && parent.checksum === checksum) {
        throw new Error('No changes detected. Nothing to commit.');
      }
    }
    
    const version: Version = {
      id: this.generateVersionId(),
      parentId,
      timestamp: new Date(),
      author,
      message,
      checksum,
      scenario: this.deepClone(scenario)
    };
    
    // Calculate diff from parent
    if (parentId) {
      const parent = this.versions.get(parentId);
      if (parent) {
        version.diff = this.calculateDiff(parent.scenario, scenario);
      }
    }
    
    // Store version
    this.versions.set(version.id, version);
    
    // Update branch head
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.headVersionId = version.id;
    }
    
    return version;
  }
  
  /**
   * Create a new branch
   */
  createBranch(name: string, description: string = ''): Branch {
    if (this.branches.has(name)) {
      throw new Error(`Branch '${name}' already exists`);
    }
    
    const currentHead = this.getCurrentHead();
    const branch: Branch = {
      name,
      headVersionId: currentHead || '',
      created: new Date(),
      description
    };
    
    this.branches.set(name, branch);
    return branch;
  }
  
  /**
   * Switch to a different branch
   */
  checkout(branchName: string): void {
    if (!this.branches.has(branchName)) {
      throw new Error(`Branch '${branchName}' does not exist`);
    }
    
    this.currentBranch = branchName;
  }
  
  /**
   * Merge branches
   */
  merge(
    sourceBranch: string,
    targetBranch: string = this.currentBranch,
    message?: string
  ): Version | null {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);
    
    if (!source || !target) {
      throw new Error('Invalid branch names');
    }
    
    const sourceVersion = this.versions.get(source.headVersionId);
    const targetVersion = this.versions.get(target.headVersionId);
    
    if (!sourceVersion || !targetVersion) {
      return null;
    }
    
    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(
      source.headVersionId,
      target.headVersionId
    );
    
    if (!commonAncestor) {
      throw new Error('No common ancestor found. Cannot merge unrelated histories.');
    }
    
    // If target is already up to date
    if (source.headVersionId === target.headVersionId) {
      return null;
    }
    
    // If source is behind target (fast-forward)
    if (this.isAncestor(source.headVersionId, target.headVersionId)) {
      target.headVersionId = source.headVersionId;
      return sourceVersion;
    }
    
    // Three-way merge
    const mergedScenario = this.threeWayMerge(
      commonAncestor,
      sourceVersion.scenario,
      targetVersion.scenario
    );
    
    // Create merge commit
    const mergeMessage = message || 
      `Merge branch '${sourceBranch}' into ${targetBranch}`;
    
    this.checkout(targetBranch);
    return this.commit(mergedScenario, mergeMessage, 'System');
  }
  
  /**
   * Revert to a previous version
   */
  revert(versionId: string): Version {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }
    
    // Create a new commit that undoes the changes
    const revertMessage = `Revert "${version.message}"`;
    return this.commit(version.scenario, revertMessage, 'System');
  }
  
  /**
   * Tag a version
   */
  tag(versionId: string, tagName: string): void {
    if (!this.versions.has(versionId)) {
      throw new Error(`Version ${versionId} not found`);
    }
    
    if (this.tags.has(tagName)) {
      throw new Error(`Tag '${tagName}' already exists`);
    }
    
    this.tags.set(tagName, versionId);
  }
  
  /**
   * Get version history
   */
  getHistory(limit?: number): Version[] {
    const head = this.getCurrentHead();
    if (!head) return [];
    
    const history: Version[] = [];
    let currentId: string | null = head;
    let count = 0;
    
    while (currentId && (!limit || count < limit)) {
      const version = this.versions.get(currentId);
      if (!version) break;
      
      history.push(version);
      currentId = version.parentId;
      count++;
    }
    
    return history;
  }
  
  /**
   * Get diff between two versions
   */
  getDiff(versionId1: string, versionId2: string): VersionDiff | null {
    const v1 = this.versions.get(versionId1);
    const v2 = this.versions.get(versionId2);
    
    if (!v1 || !v2) return null;
    
    return this.calculateDiff(v1.scenario, v2.scenario);
  }
  
  /**
   * Calculate checksum using MD5
   */
  private calculateChecksum(scenario: LightingScenario): string {
    const data = JSON.stringify({
      fixtures: scenario.fixtures.sort((a, b) => a.id.localeCompare(b.id)),
      roomConfig: scenario.roomConfig
    });
    
    return createHash('md5').update(data).digest('hex');
  }
  
  /**
   * Calculate differences between scenarios
   */
  private calculateDiff(
    oldScenario: LightingScenario,
    newScenario: LightingScenario
  ): VersionDiff {
    const diff: VersionDiff = {
      added: { fixtures: [], properties: {} },
      removed: { fixtures: [], properties: {} },
      modified: { fixtures: [] }
    };
    
    // Create fixture maps
    const oldFixtures = new Map(oldScenario.fixtures.map(f => [f.id, f]));
    const newFixtures = new Map(newScenario.fixtures.map(f => [f.id, f]));
    
    // Find added fixtures
    newFixtures.forEach((fixture, id) => {
      if (!oldFixtures.has(id)) {
        diff.added.fixtures.push(id);
      }
    });
    
    // Find removed fixtures
    oldFixtures.forEach((fixture, id) => {
      if (!newFixtures.has(id)) {
        diff.removed.fixtures.push(id);
      }
    });
    
    // Find modified fixtures
    oldFixtures.forEach((oldFixture, id) => {
      const newFixture = newFixtures.get(id);
      if (!newFixture) return;
      
      const changes: Record<string, { old: any; new: any }> = {};
      
      // Check position
      if (JSON.stringify(oldFixture.position) !== JSON.stringify(newFixture.position)) {
        changes.position = { old: oldFixture.position, new: newFixture.position };
      }
      
      // Check PPFD
      if (oldFixture.ppfd !== newFixture.ppfd) {
        changes.ppfd = { old: oldFixture.ppfd, new: newFixture.ppfd };
      }
      
      // Check spectrum
      if (JSON.stringify(oldFixture.spectrum) !== JSON.stringify(newFixture.spectrum)) {
        changes.spectrum = { old: oldFixture.spectrum, new: newFixture.spectrum };
      }
      
      if (Object.keys(changes).length > 0) {
        diff.modified.fixtures.push({ id, changes });
      }
    });
    
    // Check room config
    const roomChanges: Record<string, { old: any; new: any }> = {};
    (Object.keys(oldScenario.roomConfig) as Array<keyof typeof oldScenario.roomConfig>).forEach(key => {
      if (oldScenario.roomConfig[key] !== newScenario.roomConfig[key]) {
        roomChanges[key] = {
          old: oldScenario.roomConfig[key],
          new: newScenario.roomConfig[key]
        };
      }
    });
    
    if (Object.keys(roomChanges).length > 0) {
      diff.modified.roomConfig = roomChanges;
    }
    
    return diff;
  }
  
  /**
   * Three-way merge for conflict resolution
   */
  private threeWayMerge(
    ancestorId: string,
    source: LightingScenario,
    target: LightingScenario
  ): LightingScenario {
    const ancestor = this.versions.get(ancestorId)?.scenario;
    if (!ancestor) {
      throw new Error('Cannot perform three-way merge without common ancestor');
    }
    
    // Simple merge strategy: take non-conflicting changes from both
    const merged: LightingScenario = this.deepClone(target);
    
    // Merge fixtures
    const ancestorFixtures = new Map(ancestor.fixtures.map(f => [f.id, f]));
    const sourceFixtures = new Map(source.fixtures.map(f => [f.id, f]));
    const targetFixtures = new Map(target.fixtures.map(f => [f.id, f]));
    
    // Add fixtures that were added in source but not in target
    sourceFixtures.forEach((fixture, id) => {
      if (!ancestorFixtures.has(id) && !targetFixtures.has(id)) {
        merged.fixtures.push(this.deepClone(fixture));
      }
    });
    
    // For conflicts, prefer target (current branch)
    // In a real implementation, this would prompt for user resolution
    
    // Recalculate metrics
    merged.metrics = this.calculateMetrics(merged);
    
    return merged;
  }
  
  /**
   * Find common ancestor of two versions
   */
  private findCommonAncestor(v1: string, v2: string): string | null {
    const ancestors1 = this.getAncestors(v1);
    const ancestors2 = this.getAncestors(v2);
    
    // Find first common ancestor
    for (const ancestor of ancestors1) {
      if (ancestors2.has(ancestor)) {
        return ancestor;
      }
    }
    
    return null;
  }
  
  /**
   * Get all ancestors of a version
   */
  private getAncestors(versionId: string): Set<string> {
    const ancestors = new Set<string>();
    let current: string | null = versionId;
    
    while (current) {
      ancestors.add(current);
      const version = this.versions.get(current);
      current = version?.parentId || null;
    }
    
    return ancestors;
  }
  
  /**
   * Check if one version is ancestor of another
   */
  private isAncestor(ancestorId: string, descendantId: string): boolean {
    const ancestors = this.getAncestors(descendantId);
    return ancestors.has(ancestorId);
  }
  
  /**
   * Get current HEAD version
   */
  private getCurrentHead(): string | null {
    const branch = this.branches.get(this.currentBranch);
    return branch?.headVersionId || null;
  }
  
  /**
   * Generate unique version ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
  
  /**
   * Deep clone object
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Calculate scenario metrics
   */
  private calculateMetrics(scenario: LightingScenario): LightingScenario['metrics'] {
    // Simplified calculation
    const totalPPFD = scenario.fixtures.reduce((sum, f) => sum + f.ppfd, 0);
    const avgPPFD = totalPPFD / scenario.fixtures.length;
    const minPPFD = Math.min(...scenario.fixtures.map(f => f.ppfd));
    
    return {
      totalPPFD,
      uniformity: (minPPFD / avgPPFD) * 100,
      energyCost: totalPPFD * 0.001 * 0.15, // Simplified cost calculation
      dli: (totalPPFD * 16 * 3600) / 1000000 // 16-hour photoperiod
    };
  }
  
  /**
   * Export version history
   */
  exportHistory(): {
    versions: Version[];
    branches: Branch[];
    tags: Array<{ name: string; versionId: string }>;
  } {
    return {
      versions: Array.from(this.versions.values()),
      branches: Array.from(this.branches.values()),
      tags: Array.from(this.tags.entries()).map(([name, versionId]) => ({
        name,
        versionId
      }))
    };
  }
  
  /**
   * Import version history
   */
  importHistory(data: ReturnType<typeof this.exportHistory>): void {
    // Clear existing data
    this.versions.clear();
    this.branches.clear();
    this.tags.clear();
    
    // Import versions
    data.versions.forEach(version => {
      this.versions.set(version.id, version);
    });
    
    // Import branches
    data.branches.forEach(branch => {
      this.branches.set(branch.name, branch);
    });
    
    // Import tags
    data.tags.forEach(tag => {
      this.tags.set(tag.name, tag.versionId);
    });
  }
}

// Export singleton instance
export const versionControl = new ScenarioVersionControl();