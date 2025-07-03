import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LightingProject {
  id?: string;
  user_id: string;
  name: string;
  description?: string;
  room_dimensions: {
    width: number;
    length: number;
    height: number;
  };
  objects: any[];
  dimming_levels: Record<string, number>;
  calculation_settings: {
    grid_size: number;
    calculation_height: number;
    reflection_factors: {
      ceiling: number;
      walls: number;
      floor: number;
    };
  };
  metadata: {
    created_at: string;
    updated_at: string;
    version: string;
    software: string;
  };
  bim_data?: {
    ifc_guid?: string;
    building_name?: string;
    floor_level?: string;
    room_number?: string;
  };
}

export class ProjectManager {
  static async saveProject(project: Omit<LightingProject, 'id' | 'metadata'>): Promise<string> {
    const metadata = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0',
      software: 'Vibelux Advanced Designer'
    };

    const { data, error } = await supabase
      .from('lighting_projects')
      .insert([{ ...project, metadata }])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  static async loadProject(projectId: string): Promise<LightingProject> {
    const { data, error } = await supabase
      .from('lighting_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProject(projectId: string, updates: Partial<LightingProject>): Promise<void> {
    const { error } = await supabase
      .from('lighting_projects')
      .update({
        ...updates,
        'metadata.updated_at': new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  }

  static async listProjects(userId: string): Promise<LightingProject[]> {
    const { data, error } = await supabase
      .from('lighting_projects')
      .select('*')
      .eq('user_id', userId)
      .order('metadata->updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('lighting_projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  static async exportToIFC(project: LightingProject): Promise<string> {
    // IFC 2x3 format export
    let ifcContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Vibelux Lighting Design'),'2;1');
FILE_NAME('${project.name}.ifc','${new Date().toISOString()}',('Vibelux'),('Vibelux Advanced Designer'),'IFC2X3','Vibelux IFC Exporter','');
FILE_SCHEMA(('IFC2X3'));
ENDSEC;
DATA;
`;

    // Add project structure
    const projectGuid = project.bim_data?.ifc_guid || generateGUID();
    ifcContent += `#1=IFCPROJECT('${projectGuid}',#2,'${project.name}','${project.description || ''}','','',$,#3,$);
#2=IFCOWNERHISTORY(#4,#5,$,.ADDED.,$,$,$,${Date.now()});
#3=IFCUNITASSIGNMENT((#6,#7,#8));
#4=IFCPERSONANDORGANIZATION(#9,#10,$);
#5=IFCAPPLICATION(#10,'1.0','Vibelux Advanced Designer','Vibelux');
#6=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#7=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#8=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);
#9=IFCPERSON($,'User',$,$,$,$,$,$);
#10=IFCORGANIZATION($,'Vibelux',$,$,$);
`;

    // Add building and space
    const buildingGuid = generateGUID();
    const spaceGuid = generateGUID();
    ifcContent += `#11=IFCBUILDING('${buildingGuid}',#2,'${project.bim_data?.building_name || 'Building'}',$,$,#12,$,$,.ELEMENT.,$,$,$);
#12=IFCLOCALPLACEMENT($,#13);
#13=IFCAXIS2PLACEMENT3D(#14,$,$);
#14=IFCCARTESIANPOINT((0.,0.,0.));
#15=IFCSPACE('${spaceGuid}',#2,'${project.bim_data?.room_number || 'Room'}',$,$,#16,$,$,.ELEMENT.,.INTERNAL.,$);
#16=IFCLOCALPLACEMENT(#12,#17);
#17=IFCAXIS2PLACEMENT3D(#18,$,$);
#18=IFCCARTESIANPOINT((0.,0.,${project.bim_data?.floor_level || '0.'}));
`;

    // Add fixtures as IfcLightFixture
    let entityId = 19;
    project.objects.forEach((obj: any) => {
      if (obj.type === 'fixture') {
        const fixtureGuid = generateGUID();
        ifcContent += `#${entityId}=IFCLIGHTFIXTURE('${fixtureGuid}',#2,'${obj.model.name}',$,$,#${entityId+1},$,$);
#${entityId+1}=IFCLOCALPLACEMENT(#16,#${entityId+2});
#${entityId+2}=IFCAXIS2PLACEMENT3D(#${entityId+3},$,$);
#${entityId+3}=IFCCARTESIANPOINT((${obj.x},${obj.y},${obj.z}));
`;
        entityId += 4;
      }
    });

    ifcContent += `ENDSEC;
END-ISO-10303-21;`;

    return ifcContent;
  }

  static async importFromIFC(ifcContent: string): Promise<Partial<LightingProject>> {
    // Basic IFC parser - in production, use a proper IFC parsing library
    const project: Partial<LightingProject> = {
      objects: [],
      room_dimensions: { width: 10, length: 10, height: 3 }
    };

    // Extract project name
    const projectMatch = ifcContent.match(/IFCPROJECT\('[^']+',#\d+,'([^']+)'/);
    if (projectMatch) {
      project.name = projectMatch[1];
    }

    // Extract fixtures
    const fixtureRegex = /IFCLIGHTFIXTURE\('[^']+',#\d+,'([^']+)'.*?IFCCARTESIANPOINT\(\(([^,]+),([^,]+),([^)]+)\)\)/gs;
    let match;
    while ((match = fixtureRegex.exec(ifcContent)) !== null) {
      project.objects?.push({
        id: `fixture-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
        type: 'fixture',
        x: parseFloat(match[2]),
        y: parseFloat(match[3]),
        z: parseFloat(match[4]),
        model: { name: match[1] },
        enabled: true
      });
    }

    return project;
  }
}

function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}