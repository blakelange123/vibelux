import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Equipment } from '@/lib/equipment-manager';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Omit<Equipment, 'id' | 'usage' | 'maintenance'> & { initialHours?: number }) => void;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'lighting' as Equipment['type'],
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiration: '',
    initialHours: '0',
    location: {
      facility: '',
      room: '',
      zone: ''
    },
    status: 'active' as Equipment['status'],
    specifications: {
      power: '',
      voltage: '',
      amperage: '',
      capacity: '',
      efficiency: '',
      expectedLifetime: ''
    },
    cost: {
      purchase: '',
      installation: '',
      annualMaintenance: '',
      energyCost: ''
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const equipment = {
      ...formData,
      initialHours: Number(formData.initialHours) || 0,
      purchaseDate: new Date(formData.purchaseDate),
      warrantyExpiration: formData.warrantyExpiration ? new Date(formData.warrantyExpiration) : undefined,
      specifications: {
        power: formData.specifications.power ? Number(formData.specifications.power) : undefined,
        voltage: formData.specifications.voltage ? Number(formData.specifications.voltage) : undefined,
        amperage: formData.specifications.amperage ? Number(formData.specifications.amperage) : undefined,
        capacity: formData.specifications.capacity ? Number(formData.specifications.capacity) : undefined,
        efficiency: formData.specifications.efficiency ? Number(formData.specifications.efficiency) : undefined,
        expectedLifetime: formData.specifications.expectedLifetime ? Number(formData.specifications.expectedLifetime) : undefined,
      },
      cost: {
        purchase: Number(formData.cost.purchase) || 0,
        installation: formData.cost.installation ? Number(formData.cost.installation) : undefined,
        annualMaintenance: formData.cost.annualMaintenance ? Number(formData.cost.annualMaintenance) : undefined,
        energyCost: formData.cost.energyCost ? Number(formData.cost.energyCost) : undefined,
      }
    };

    onSubmit(equipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Add New Equipment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Equipment['type'] })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="lighting">Lighting</option>
                  <option value="hvac">HVAC</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="sensor">Sensor</option>
                  <option value="pump">Pump</option>
                  <option value="fan">Fan</option>
                  <option value="dehumidifier">Dehumidifier</option>
                  <option value="controller">Controller</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Location & Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Location & Dates</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Facility *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.facility}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, facility: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Room *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.room}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, room: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Zone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.zone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, zone: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Warranty Expiration
                </label>
                <input
                  type="date"
                  value={formData.warrantyExpiration}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Initial Operating Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.initialHours}
                  onChange={(e) => setFormData({ ...formData, initialHours: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For retrofitting existing equipment, enter current lifetime hours
                </p>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Power (Watts)
                </label>
                <input
                  type="number"
                  value={formData.specifications.power}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications, power: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Voltage
                </label>
                <input
                  type="number"
                  value={formData.specifications.voltage}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications, voltage: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amperage
                </label>
                <input
                  type="number"
                  value={formData.specifications.amperage}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications, amperage: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Efficiency (%)
                </label>
                <input
                  type="number"
                  value={formData.specifications.efficiency}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications, efficiency: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Expected Lifetime (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.specifications.expectedLifetime}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications, expectedLifetime: e.target.value }
                  })}
                  placeholder="50000"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Manufacturer's rated lifetime (e.g., 50,000 hours for LED)
                </p>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Purchase Price ($) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.cost.purchase}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    cost: { ...formData.cost, purchase: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Installation Cost ($)
                </label>
                <input
                  type="number"
                  value={formData.cost.installation}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    cost: { ...formData.cost, installation: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Annual Maintenance ($)
                </label>
                <input
                  type="number"
                  value={formData.cost.annualMaintenance}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    cost: { ...formData.cost, annualMaintenance: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Energy Cost ($/month)
                </label>
                <input
                  type="number"
                  value={formData.cost.energyCost}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    cost: { ...formData.cost, energyCost: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Equipment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};