import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DbtConfig {
  projectPath: string;
  profilesPath: string;
  target: string;
  varsFile?: string;
  threadsCount?: number;
}

export interface DbtRunResult {
  success: boolean;
  results: DbtModelResult[];
  elapsed: number;
  generated_at: Date;
}

export interface DbtModelResult {
  unique_id: string;
  status: 'success' | 'error' | 'skipped';
  execution_time: number;
  message?: string;
  failures?: number;
  thread_id: string;
  adapter_response?: any;
}

export interface DbtTestResult {
  success: boolean;
  results: DbtTestModelResult[];
  elapsed: number;
}

export interface DbtTestModelResult {
  unique_id: string;
  status: 'pass' | 'fail' | 'error' | 'skipped';
  failures: number;
  message?: string;
  execution_time: number;
}

export interface DbtProfile {
  [target: string]: {
    type: string;
    host: string;
    port: number;
    user: string;
    password: string;
    dbname: string;
    schema: string;
    threads: number;
    keepalives_idle?: number;
    search_path?: string;
    sslmode?: string;
  };
}

export interface DbtProject {
  name: string;
  version: string;
  profile: string;
  'model-paths': string[];
  'analysis-paths': string[];
  'test-paths': string[];
  'seed-paths': string[];
  'macro-paths': string[];
  'snapshot-paths': string[];
  'target-path': string;
  'clean-targets': string[];
  models: Record<string, any>;
  vars: Record<string, any>;
}

export interface LineageNode {
  unique_id: string;
  name: string;
  resource_type: 'source' | 'model' | 'seed' | 'snapshot' | 'test';
  depends_on: string[];
  config: any;
  tags: string[];
  description?: string;
}

export interface LineageGraph {
  nodes: Record<string, LineageNode>;
  parent_map: Record<string, string[]>;
  child_map: Record<string, string[]>;
}

export class DbtRunner {
  private config: DbtConfig;
  private dbtExecutable: string;

  constructor(config: DbtConfig) {
    this.config = config;
    this.dbtExecutable = process.env.DBT_EXECUTABLE || 'dbt';
  }

  // Run dbt models
  async run(models?: string[], fullRefresh?: boolean): Promise<DbtRunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['run'];
      
      if (models && models.length > 0) {
        args.push('--models', models.join(' '));
      }
      
      if (fullRefresh) {
        args.push('--full-refresh');
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);
      
      if (this.config.threadsCount) {
        args.push('--threads', this.config.threadsCount.toString());
      }

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseRunResults(result.output),
        elapsed,
        generated_at: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
        generated_at: new Date(),
      };
    }
  }

  // Test dbt models
  async test(models?: string[]): Promise<DbtTestResult> {
    const startTime = Date.now();
    
    try {
      const args = ['test'];
      
      if (models && models.length > 0) {
        args.push('--models', models.join(' '));
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseTestResults(result.output),
        elapsed,
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
      };
    }
  }

  // Compile dbt models
  async compile(models?: string[]): Promise<DbtRunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['compile'];
      
      if (models && models.length > 0) {
        args.push('--models', models.join(' '));
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseRunResults(result.output),
        elapsed,
        generated_at: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
        generated_at: new Date(),
      };
    }
  }

  // Parse dbt project dependencies
  async parse(): Promise<LineageGraph> {
    try {
      const args = ['parse'];
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      await this.executeDbtCommand(args);
      
      // Read the manifest.json file generated by dbt parse
      const manifestPath = path.join(this.config.projectPath, 'target', 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      return this.buildLineageGraph(manifest);
    } catch (error) {
      console.error('Failed to parse dbt project:', error);
      throw error;
    }
  }

  // Generate documentation
  async generateDocs(): Promise<void> {
    try {
      // Generate docs
      await this.executeDbtCommand([
        'docs', 'generate',
        '--target', this.config.target,
        '--project-dir', this.config.projectPath,
        '--profiles-dir', this.config.profilesPath,
      ]);
      
    } catch (error) {
      console.error('Failed to generate dbt docs:', error);
      throw error;
    }
  }

  // Serve documentation
  async serveDocs(port: number = 8080): Promise<ChildProcess> {
    try {
      const args = [
        'docs', 'serve',
        '--port', port.toString(),
        '--project-dir', this.config.projectPath,
        '--profiles-dir', this.config.profilesPath,
      ];

      const process = spawn(this.dbtExecutable, args, {
        cwd: this.config.projectPath,
        stdio: 'pipe',
      });

      return process;
    } catch (error) {
      console.error('Failed to serve dbt docs:', error);
      throw error;
    }
  }

  // Run snapshots
  async snapshot(snapshots?: string[]): Promise<DbtRunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['snapshot'];
      
      if (snapshots && snapshots.length > 0) {
        args.push('--select', snapshots.join(' '));
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseRunResults(result.output),
        elapsed,
        generated_at: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
        generated_at: new Date(),
      };
    }
  }

  // Seed data
  async seed(seeds?: string[]): Promise<DbtRunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['seed'];
      
      if (seeds && seeds.length > 0) {
        args.push('--select', seeds.join(' '));
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseRunResults(result.output),
        elapsed,
        generated_at: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
        generated_at: new Date(),
      };
    }
  }

  // Fresh source tests
  async sourceFreshness(sources?: string[]): Promise<DbtTestResult> {
    const startTime = Date.now();
    
    try {
      const args = ['source', 'freshness'];
      
      if (sources && sources.length > 0) {
        args.push('--select', sources.join(' '));
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseTestResults(result.output),
        elapsed,
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
      };
    }
  }

  // Clean dbt artifacts
  async clean(): Promise<void> {
    try {
      await this.executeDbtCommand([
        'clean',
        '--project-dir', this.config.projectPath,
        '--profiles-dir', this.config.profilesPath,
      ]);
      
    } catch (error) {
      console.error('Failed to clean dbt artifacts:', error);
      throw error;
    }
  }

  // Get model lineage
  async getModelLineage(modelName: string): Promise<{
    upstream: string[];
    downstream: string[];
  }> {
    try {
      const lineageGraph = await this.parse();
      const modelId = `model.${this.getProjectName()}.${modelName}`;
      
      return {
        upstream: lineageGraph.parent_map[modelId] || [],
        downstream: lineageGraph.child_map[modelId] || [],
      };
    } catch (error) {
      console.error(`Failed to get lineage for model ${modelName}:`, error);
      return { upstream: [], downstream: [] };
    }
  }

  // Validate dbt project
  async validate(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const result = await this.executeDbtCommand([
        'parse',
        '--target', this.config.target,
        '--project-dir', this.config.projectPath,
        '--profiles-dir', this.config.profilesPath,
      ]);
      
      return {
        valid: result.success,
        errors: this.extractErrors(result.output),
        warnings: this.extractWarnings(result.output),
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  // Execute dbt with custom vars
  async runWithVars(models: string[], vars: Record<string, any>): Promise<DbtRunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['run'];
      args.push('--models', models.join(' '));
      args.push('--vars', JSON.stringify(vars));
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      const elapsed = Date.now() - startTime;
      
      return {
        success: result.success,
        results: this.parseRunResults(result.output),
        elapsed,
        generated_at: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        elapsed: Date.now() - startTime,
        generated_at: new Date(),
      };
    }
  }

  // List resources
  async listResources(resourceType?: 'models' | 'tests' | 'sources' | 'snapshots'): Promise<string[]> {
    try {
      const args = ['list'];
      
      if (resourceType) {
        args.push('--resource-type', resourceType);
      }
      
      args.push('--target', this.config.target);
      args.push('--project-dir', this.config.projectPath);
      args.push('--profiles-dir', this.config.profilesPath);

      const result = await this.executeDbtCommand(args);
      
      return result.output
        .split('\n')
        .filter(line => line.trim() && !line.includes('Found'))
        .map(line => line.trim());
    } catch (error) {
      console.error('Failed to list dbt resources:', error);
      return [];
    }
  }

  // Debug connection
  async debug(): Promise<{
    connection: boolean;
    profile: boolean;
    dependencies: boolean;
    errors: string[];
  }> {
    try {
      const result = await this.executeDbtCommand([
        'debug',
        '--target', this.config.target,
        '--project-dir', this.config.projectPath,
        '--profiles-dir', this.config.profilesPath,
      ]);
      
      return {
        connection: result.output.includes('Connection test: [OK connection ok]'),
        profile: result.output.includes('Profile loading: [OK found and valid]'),
        dependencies: result.output.includes('Dependencies: [OK required dependencies found]'),
        errors: this.extractErrors(result.output),
      };
    } catch (error) {
      return {
        connection: false,
        profile: false,
        dependencies: false,
        errors: [error.message],
      };
    }
  }

  // Private helper methods
  private async executeDbtCommand(args: string[]): Promise<{
    success: boolean;
    output: string;
    error?: string;
  }> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const process = spawn(this.dbtExecutable, args, {
        cwd: this.config.projectPath,
        stdio: 'pipe',
      });

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output + errorOutput,
          });
        } else {
          resolve({
            success: false,
            output: output + errorOutput,
            error: errorOutput,
          });
        }
      });

      process.on('error', (error) => {
        reject(error);
      });

      // Set timeout for long-running operations
      setTimeout(() => {
        process.kill();
        reject(new Error('dbt command timed out'));
      }, 300000); // 5 minutes timeout
    });
  }

  private parseRunResults(output: string): DbtModelResult[] {
    const results: DbtModelResult[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Completed successfully') || line.includes('Completed with')) {
        // Parse dbt run results
        const match = line.match(/(\w+\.\w+\.\w+)\s+\.\.\.\s+\[(.+?)\s+in\s+([\d.]+)s\]/);
        if (match) {
          results.push({
            unique_id: match[1],
            status: match[2].toLowerCase().includes('error') ? 'error' : 'success',
            execution_time: parseFloat(match[3]),
            thread_id: 'main',
          });
        }
      }
    }
    
    return results;
  }

  private parseTestResults(output: string): DbtTestModelResult[] {
    const results: DbtTestModelResult[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('PASS') || line.includes('FAIL') || line.includes('ERROR')) {
        // Parse dbt test results
        const match = line.match(/(\w+\.\w+\.\w+)\s+\.\.\.\s+\[(.+?)\s+in\s+([\d.]+)s\]/);
        if (match) {
          const status = match[2].toLowerCase();
          results.push({
            unique_id: match[1],
            status: status.includes('pass') ? 'pass' : 
                   status.includes('fail') ? 'fail' : 'error',
            failures: status.includes('fail') ? 1 : 0,
            execution_time: parseFloat(match[3]),
          });
        }
      }
    }
    
    return results;
  }

  private buildLineageGraph(manifest: any): LineageGraph {
    const nodes: Record<string, LineageNode> = {};
    const parentMap: Record<string, string[]> = {};
    const childMap: Record<string, string[]> = {};

    // Process all nodes from manifest
    for (const [nodeId, node] of Object.entries(manifest.nodes || {})) {
      const nodeData = node as any;
      
      nodes[nodeId] = {
        unique_id: nodeId,
        name: nodeData.name,
        resource_type: nodeData.resource_type,
        depends_on: nodeData.depends_on?.nodes || [],
        config: nodeData.config || {},
        tags: nodeData.tags || [],
        description: nodeData.description,
      };

      // Build parent-child relationships
      const dependencies = nodeData.depends_on?.nodes || [];
      parentMap[nodeId] = dependencies;
      
      for (const dep of dependencies) {
        if (!childMap[dep]) {
          childMap[dep] = [];
        }
        childMap[dep].push(nodeId);
      }
    }

    return {
      nodes,
      parent_map: parentMap,
      child_map: childMap,
    };
  }

  private extractErrors(output: string): string[] {
    const errors: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('compilation error')) {
        errors.push(line.trim());
      }
    }
    
    return errors;
  }

  private extractWarnings(output: string): string[] {
    const warnings: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('deprecated')) {
        warnings.push(line.trim());
      }
    }
    
    return warnings;
  }

  private async getProjectName(): Promise<string> {
    try {
      const projectPath = path.join(this.config.projectPath, 'dbt_project.yml');
      const projectContent = await fs.readFile(projectPath, 'utf-8');
      
      // Simple YAML parsing for project name
      const nameMatch = projectContent.match(/name:\s*['"]?([^'"\n]+)['"]?/);
      return nameMatch ? nameMatch[1] : 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// Utility class for dbt project management
export class DbtProjectManager {
  static async initializeProject(
    projectPath: string,
    projectName: string,
    profile: DbtProfile
  ): Promise<void> {
    // Create project structure
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'models'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'tests'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'macros'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'seeds'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'snapshots'), { recursive: true });

    // Create dbt_project.yml
    const dbtProject: DbtProject = {
      name: projectName,
      version: '1.0.0',
      profile: projectName,
      'model-paths': ['models'],
      'analysis-paths': ['analyses'],
      'test-paths': ['tests'],
      'seed-paths': ['seeds'],
      'macro-paths': ['macros'],
      'snapshot-paths': ['snapshots'],
      'target-path': 'target',
      'clean-targets': ['target', 'dbt_packages'],
      models: {
        [projectName]: {
          '+materialized': 'table',
        },
      },
      vars: {},
    };

    await fs.writeFile(
      path.join(projectPath, 'dbt_project.yml'),
      this.yamlStringify(dbtProject)
    );

    // Create profiles.yml
    const profilesPath = path.join(projectPath, 'profiles.yml');
    await fs.writeFile(
      profilesPath,
      this.yamlStringify({ [projectName]: profile })
    );

  }

  static async createModel(
    projectPath: string,
    modelName: string,
    sql: string,
    config?: any
  ): Promise<void> {
    const modelPath = path.join(projectPath, 'models', `${modelName}.sql`);
    
    let modelContent = '';
    
    if (config) {
      modelContent += `{{ config(${JSON.stringify(config)}) }}\n\n`;
    }
    
    modelContent += sql;
    
    await fs.writeFile(modelPath, modelContent);
  }

  static async createTest(
    projectPath: string,
    testName: string,
    sql: string
  ): Promise<void> {
    const testPath = path.join(projectPath, 'tests', `${testName}.sql`);
    await fs.writeFile(testPath, sql);
  }

  private static yamlStringify(obj: any): string {
    // Simple YAML stringification
    // In production, use a proper YAML library
    return JSON.stringify(obj, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '');
  }
}