'use client';

import React from 'react';
import { Info, Tag, Layers, Hash } from 'lucide-react';
import { bimIfcHandler } from '@/lib/bim-ifc-handler';
import type { RoomObject } from '@/components/designer/context/types';

interface BIMPropertiesPanelProps {
  object: RoomObject | null;
  buildingHierarchy?: {
    project?: string;
    building?: string;
    storey?: string;
    space?: string;
  };
}

export function BIMPropertiesPanel({ object, buildingHierarchy }: BIMPropertiesPanelProps) {
  if (!object) {
    return (
      <div className="p-4 bg-gray-800 rounded text-gray-400 text-sm">
        <p>Select an object to view BIM properties</p>
      </div>
    );
  }

  const bimProps = bimIfcHandler.getBIMProperties(object);

  return (
    <div className="space-y-4">
      {/* BIM Identification */}
      <div className="p-4 bg-gray-800 rounded">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          BIM Identification
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">IFC GUID:</span>
            <div className="text-white font-mono text-xs mt-1 break-all">
              {bimProps.guid}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Entity Type:</span>
            <span className="text-white ml-2">{getIfcEntityType(object)}</span>
          </div>
        </div>
      </div>

      {/* Building Hierarchy */}
      {buildingHierarchy && (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Building Hierarchy
          </h3>
          <div className="space-y-1 text-sm">
            {buildingHierarchy.project && (
              <div className="pl-0">
                <span className="text-gray-500">Project:</span>
                <span className="text-white ml-2">{buildingHierarchy.project}</span>
              </div>
            )}
            {buildingHierarchy.building && (
              <div className="pl-4">
                <span className="text-gray-500">Building:</span>
                <span className="text-white ml-2">{buildingHierarchy.building}</span>
              </div>
            )}
            {buildingHierarchy.storey && (
              <div className="pl-8">
                <span className="text-gray-500">Storey:</span>
                <span className="text-white ml-2">{buildingHierarchy.storey}</span>
              </div>
            )}
            {buildingHierarchy.space && (
              <div className="pl-12">
                <span className="text-gray-500">Space:</span>
                <span className="text-white ml-2">{buildingHierarchy.space}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Classification */}
      {bimProps.classification && (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Classification
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">System:</span>
              <span className="text-white ml-2">{bimProps.classification.system}</span>
            </div>
            <div>
              <span className="text-gray-500">Code:</span>
              <span className="text-white ml-2 font-mono">{bimProps.classification.code}</span>
            </div>
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="text-white ml-2">{bimProps.classification.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Properties */}
      {Object.keys(bimProps.customProperties).length > 0 && (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Custom Properties
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(bimProps.customProperties).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-500">{formatPropertyName(key)}:</span>
                <span className="text-white ml-2">{formatPropertyValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type-specific Properties */}
      {object.type === 'fixture' && (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Photometric Properties</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">PPF:</span>
              <span className="text-white ml-2">{(object as any).model.ppf} μmol/s</span>
            </div>
            <div>
              <span className="text-gray-500">Wattage:</span>
              <span className="text-white ml-2">{(object as any).model.wattage} W</span>
            </div>
            <div>
              <span className="text-gray-500">Efficacy:</span>
              <span className="text-white ml-2">
                {(object as any).model.efficacy || ((object as any).model.ppf / (object as any).model.wattage).toFixed(2)} μmol/J
              </span>
            </div>
            <div>
              <span className="text-gray-500">Beam Angle:</span>
              <span className="text-white ml-2">{(object as any).model.beamAngle}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Export Info */}
      <div className="p-4 bg-gray-700 rounded text-xs text-gray-400">
        <p className="mb-1">This object will be exported as:</p>
        <p className="text-white font-mono">{getIfcEntityType(object)}</p>
        <p className="mt-2">All properties will be preserved in IFC PropertySets</p>
      </div>
    </div>
  );
}

function getIfcEntityType(object: RoomObject): string {
  const typeMap: Record<string, string> = {
    fixture: 'IfcLightFixture',
    plant: 'IfcBuildingElementProxy',
    bench: 'IfcFurnishingElement',
    greenhouse: 'IfcBuilding',
    window: 'IfcWindow',
    rack: 'IfcFurnishingElement',
    underCanopy: 'IfcLightFixture'
  };
  
  return typeMap[object.type] || 'IfcBuildingElementProxy';
}

function formatPropertyName(key: string): string {
  // Convert camelCase to readable format
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatPropertyValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return String(value);
}