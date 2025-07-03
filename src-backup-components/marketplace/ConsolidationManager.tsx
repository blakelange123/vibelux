'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Building,
  Users,
  TrendingDown,
  Snowflake,
  Navigation,
  Star,
  Loader2
} from 'lucide-react';
import {
  LogisticsConsolidation,
  ConsolidationCenter,
  ConsolidationOrder,
  SourceOrder,
  ColdChainMonitoring
} from '@/lib/marketplace/logistics-consolidation';

interface ConsolidationManagerProps {
  userId: string;
  pendingOrders: SourceOrder[];
  onConsolidationComplete?: (order: ConsolidationOrder) => void;
}

export function ConsolidationManager({
  userId,
  pendingOrders,
  onConsolidationComplete
}: ConsolidationManagerProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null);
  const [showCenterDetails, setShowCenterDetails] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    instructions: ''
  });
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch consolidation centers
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/consolidation/centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrdersData = pendingOrders.filter(order => 
    selectedOrders.includes(order.id)
  );

  const handleCreateConsolidation = async () => {
    if (!selectedCenter || selectedOrdersData.length === 0) return;

    setCreating(true);
    try {
      const response = await fetch('/api/consolidation/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consolidationCenterId: selectedCenter.id,
          deliveryName: deliveryDetails.name,
          deliveryAddress: deliveryDetails.address,
          deliveryCity: deliveryDetails.city,
          deliveryState: deliveryDetails.state,
          deliveryZipCode: deliveryDetails.zipCode,
          deliveryInstructions: deliveryDetails.instructions,
          requestedDeliveryDate: deliveryDetails.deliveryDate.toISOString(),
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '17:00',
          tempRequirementMin: selectedCenter.coldStorage ? 35 : null,
          tempRequirementMax: selectedCenter.coldStorage ? 45 : null,
          tempRequirementUnit: 'F',
          sourceOrders: selectedOrdersData.map(order => ({
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            pickupLocation: order.pickup.location,
            pickupScheduledDate: order.pickup.scheduledDate,
            pickupWindowStart: order.pickup.window.start,
            pickupWindowEnd: order.pickup.window.end,
            qualityCheckRequired: order.qualityChecks?.required || false,
            qualityParameters: order.qualityChecks?.parameters || [],
            items: order.items
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        onConsolidationComplete?.(data.data);
        // Reset form
        setSelectedOrders([]);
        setSelectedCenter(null);
        setDeliveryDetails({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          instructions: ''
        });
      } else {
        console.error('Failed to create consolidation order');
      }
    } catch (error) {
      console.error('Error creating consolidation order:', error);
    } finally {
      setCreating(false);
    }
  };

  // Calculate potential savings
  const individualCosts = selectedOrdersData.map(() => 150); // Mock individual delivery costs
  const consolidatedCost = selectedCenter 
    ? (selectedCenter.consolidationFee * selectedOrdersData.length + 
       selectedCenter.storageFeePerDay * selectedOrdersData.length * 2 +
       selectedCenter.handlingFee * selectedOrdersData.length + 200)
    : 0;
  
  const savings = selectedCenter
    ? LogisticsConsolidation.calculateSavings(individualCosts, consolidatedCost)
    : null;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Order Consolidation</h2>
        <p className="text-gray-400">
          Combine multiple orders to save on shipping and reduce your carbon footprint
        </p>
      </div>

      {/* Step 1: Select Orders */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Select Orders to Consolidate
        </h3>
        
        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedOrders.includes(order.id)
                  ? 'bg-green-900/20 border-green-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedOrders(prev =>
                  prev.includes(order.id)
                    ? prev.filter(id => id !== order.id)
                    : [...prev, order.id]
                );
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedOrders.includes(order.id)
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-600'
                  }`}>
                    {selectedOrders.includes(order.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{order.supplierName}</p>
                    <p className="text-sm text-gray-400">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items • 
                      ${order.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Pickup</p>
                  <p className="text-sm text-white">
                    {new Date(order.pickup.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedOrders.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Select at least 2 orders to enable consolidation
          </p>
        )}
      </div>

      {/* Step 2: Choose Consolidation Center */}
      {selectedOrders.length >= 2 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            Choose Consolidation Center
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {centers.map((center) => {
                // Transform database center to match interface
                const centerData: ConsolidationCenter = {
                  id: center.id,
                  name: center.name,
                  location: {
                    address: center.address,
                    city: center.city,
                    state: center.state,
                    zipCode: center.zipCode,
                    coordinates: { lat: center.latitude, lng: center.longitude }
                  },
                  capabilities: {
                    coldStorage: center.coldStorage,
                    temperatureRanges: center.temperatureRanges || [],
                    maxCapacity: center.maxCapacity,
                    capacityUnit: center.capacityUnit,
                    services: center.services || []
                  },
                  availability: {
                    operatingHours: center.operatingHours || {},
                    currentUtilization: center.currentUtilization,
                    nextAvailableSlot: new Date()
                  },
                  certifications: center.certifications || [],
                  rating: center.rating,
                  costStructure: {
                    storageFee: center.storageFeePerDay,
                    handlingFee: center.handlingFee,
                    consolidationFee: center.consolidationFee
                  }
                };

                const optimal = LogisticsConsolidation.findOptimalCenter(
                  selectedOrdersData,
                  deliveryDetails,
                  [centerData]
                );

                return (
                  <div
                  key={center.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCenter?.id === center.id
                      ? 'bg-green-900/20 border-green-600'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{center.name}</h4>
                      <p className="text-sm text-gray-400">
                        {center.location.city}, {center.location.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-white">{center.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {center.coldStorage && center.temperatureRanges?.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Snowflake className="w-4 h-4 text-blue-400" />
                        <span>Cold Storage: {center.temperatureRanges[0].min}-{center.temperatureRanges[0].max}°{center.temperatureRanges[0].unit}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-300">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>Capacity: {100 - center.currentUtilization}% available</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>
                        ${center.consolidationFee}/order + 
                        ${center.storageFeePerDay}/day
                      </span>
                    </div>
                  </div>

                  {center.certifications.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {center.certifications.map(cert => (
                        <span key={cert} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  {optimal && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-green-400">
                        Estimated cost: ${optimal.estimatedCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Step 3: Delivery Details */}
      {selectedCenter && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">
              3
            </span>
            Delivery Details
          </h3>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Name
                </label>
                <input
                  type="text"
                  value={deliveryDetails.name}
                  onChange={(e) => setDeliveryDetails({
                    ...deliveryDetails,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Restaurant or Business Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDetails.deliveryDate.toISOString().split('T')[0]}
                  onChange={(e) => setDeliveryDetails({
                    ...deliveryDetails,
                    deliveryDate: new Date(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Address
              </label>
              <input
                type="text"
                value={deliveryDetails.address}
                onChange={(e) => setDeliveryDetails({
                  ...deliveryDetails,
                  address: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={deliveryDetails.city}
                  onChange={(e) => setDeliveryDetails({
                    ...deliveryDetails,
                    city: e.target.value
                  })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={deliveryDetails.state}
                  onChange={(e) => setDeliveryDetails({
                    ...deliveryDetails,
                    state: e.target.value
                  })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="State"
                />
                <input
                  type="text"
                  value={deliveryDetails.zipCode}
                  onChange={(e) => setDeliveryDetails({
                    ...deliveryDetails,
                    zipCode: e.target.value
                  })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="ZIP"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={deliveryDetails.instructions}
                onChange={(e) => setDeliveryDetails({
                  ...deliveryDetails,
                  instructions: e.target.value
                })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Loading dock location, contact person, etc."
              />
            </div>
          </div>
        </div>
      )}

      {/* Savings Summary */}
      {selectedCenter && savings && selectedOrders.length >= 2 && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              Consolidation Savings
            </h4>
            <span className="text-2xl font-bold text-green-400">
              ${savings.totalSavings.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Individual Delivery</p>
              <p className="text-white">${individualCosts.reduce((a, b) => a + b, 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Consolidated Cost</p>
              <p className="text-white">${consolidatedCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">You Save</p>
              <p className="text-green-400 font-semibold">{savings.percentageSaved.toFixed(0)}%</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
            <Truck className="w-4 h-4 text-gray-400" />
            <span>Plus reduced carbon emissions from fewer deliveries</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleCreateConsolidation}
        disabled={!selectedCenter || selectedOrders.length < 2 || !deliveryDetails.name || creating}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          selectedCenter && selectedOrders.length >= 2 && deliveryDetails.name && !creating
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {creating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Order...
          </>
        ) : (
          'Create Consolidation Order'
        )}
      </button>

      {/* Cold Chain Monitoring Preview */}
      {selectedCenter?.capabilities.coldStorage && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Cold Chain Monitoring Included</h4>
          </div>
          <p className="text-sm text-gray-300">
            Real-time temperature tracking throughout consolidation and delivery with instant alerts 
            if temperatures exceed safe ranges.
          </p>
        </div>
      )}
    </div>
  );
}