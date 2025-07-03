'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Leaf,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Activity,
  Heart,
  QrCode,
  MoreVertical,
  Droplets,
  Zap,
  Bug
} from 'lucide-react';

interface Plant {
  id: string;
  tagId: string;
  strain: string;
  stage: 'Clone' | 'Vegetative' | 'Flowering';
  location: string;
  plantedDate: string;
  age: number;
  height: number;
  health: 'Healthy' | 'Pest Issue' | 'Disease' | 'Nutrient Deficiency';
  lastWatered: string;
  lastFed: string;
}

export default function PlantTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Mock data
  const plants: Plant[] = [
    {
      id: 'PLANT-001',
      tagId: '1A4FF0100000000000000001',
      strain: 'Blue Dream',
      stage: 'Flowering',
      location: 'Flower Room 3 - Row A',
      plantedDate: '2024-01-15',
      age: 60,
      height: 48,
      health: 'Healthy',
      lastWatered: '6 hours ago',
      lastFed: '2 days ago'
    },
    {
      id: 'PLANT-002',
      tagId: '1A4FF0100000000000000002',
      strain: 'OG Kush',
      stage: 'Vegetative',
      location: 'Veg Room 2 - Row C',
      plantedDate: '2024-02-10',
      age: 35,
      height: 24,
      health: 'Pest Issue',
      lastWatered: '12 hours ago',
      lastFed: '3 days ago'
    },
    {
      id: 'PLANT-003',
      tagId: '1A4FF0100000000000000003',
      strain: 'Girl Scout Cookies',
      stage: 'Clone',
      location: 'Clone Room - Tray 5',
      plantedDate: '2024-03-01',
      age: 15,
      height: 6,
      health: 'Healthy',
      lastWatered: '2 hours ago',
      lastFed: 'N/A'
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Clone': return 'text-green-400 bg-green-900/30';
      case 'Vegetative': return 'text-blue-400 bg-blue-900/30';
      case 'Flowering': return 'text-purple-400 bg-purple-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-green-400';
      case 'Pest Issue': return 'text-red-400';
      case 'Disease': return 'text-orange-400';
      case 'Nutrient Deficiency': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || plant.stage === filterStage;
    const matchesLocation = filterLocation === 'all' || plant.location.includes(filterLocation);
    
    return matchesSearch && matchesStage && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/seed-to-sale" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Seed-to-Sale
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-green-400" />
                Plant Tracking
              </h1>
              <p className="text-gray-400">
                Monitor and manage all plants in your facility
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Move Plants
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Batch
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-sm text-gray-400">Total Plants</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">423</div>
            <div className="text-sm text-gray-400">Clones</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">892</div>
            <div className="text-sm text-gray-400">Vegetative</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">1,532</div>
            <div className="text-sm text-gray-400">Flowering</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">12</div>
            <div className="text-sm text-gray-400">Issues</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">98.5%</div>
            <div className="text-sm text-gray-400">Healthy</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tag, strain, or location..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              <option value="all">All Stages</option>
              <option value="Clone">Clone</option>
              <option value="Vegetative">Vegetative</option>
              <option value="Flowering">Flowering</option>
            </select>
            
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="Clone Room">Clone Room</option>
              <option value="Veg Room 1">Veg Room 1</option>
              <option value="Veg Room 2">Veg Room 2</option>
              <option value="Flower Room 1">Flower Room 1</option>
              <option value="Flower Room 2">Flower Room 2</option>
              <option value="Flower Room 3">Flower Room 3</option>
            </select>

            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan Plant
            </button>
          </div>
        </div>

        {/* Plant List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{plant.strain}</h3>
                  <p className="text-xs text-gray-500">{plant.tagId}</p>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-xs text-gray-400">Stage</span>
                  <div className={`text-sm px-2 py-1 rounded inline-block mt-1 ${getStageColor(plant.stage)}`}>
                    {plant.stage}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Health</span>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${getHealthColor(plant.health)}`}>
                    <Heart className="w-3 h-3" />
                    {plant.health}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </span>
                  <span className="text-gray-300">{plant.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Age
                  </span>
                  <span className="text-gray-300">{plant.age} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Height
                  </span>
                  <span className="text-gray-300">{plant.height}"</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <div className="text-gray-400">Watered</div>
                  <div className="text-gray-300">{plant.lastWatered}</div>
                </div>
                <div className="text-center">
                  <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                  <div className="text-gray-400">Fed</div>
                  <div className="text-gray-300">{plant.lastFed}</div>
                </div>
                <div className="text-center">
                  <Bug className="w-4 h-4 mx-auto mb-1 text-green-400" />
                  <div className="text-gray-400">IPM</div>
                  <div className="text-gray-300">5 days ago</div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded flex items-center justify-center gap-1">
                  View Details
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded flex items-center justify-center gap-1">
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Room Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Room Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Clone Room</h4>
              <div className="text-2xl font-bold text-green-400">423</div>
              <div className="text-sm text-gray-400">Capacity: 500</div>
              <div className="text-xs text-gray-500 mt-1">84.6% full</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Veg Rooms</h4>
              <div className="text-2xl font-bold text-blue-400">892</div>
              <div className="text-sm text-gray-400">Capacity: 1,000</div>
              <div className="text-xs text-gray-500 mt-1">89.2% full</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Flower Rooms</h4>
              <div className="text-2xl font-bold text-purple-400">1,532</div>
              <div className="text-sm text-gray-400">Capacity: 1,800</div>
              <div className="text-xs text-gray-500 mt-1">85.1% full</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-2">Total Facility</h4>
              <div className="text-2xl font-bold">2,847</div>
              <div className="text-sm text-gray-400">Capacity: 3,300</div>
              <div className="text-xs text-gray-500 mt-1">86.3% full</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}