'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Upload, X, AlertCircle, CheckCircle,
  Package, DollarSign, MapPin, Camera, Info, Zap,
  FileText, Calendar, Shield, Save, Eye, Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EquipmentFormData {
  title: string;
  category: string;
  condition: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  price: number;
  priceType: string;
  description: string;
  specifications: { key: string; value: string }[];
  energyData: {
    powerDraw: number;
    efficacy: number;
    certification: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  availability: {
    immediate: boolean;
    leadTime: number;
    expirationDays: number;
  };
  shipping: {
    available: boolean;
    cost: number;
    freeShippingThreshold: number;
  };
  warranty: {
    included: boolean;
    duration: number;
    type: string;
  };
  images: File[];
  documents: File[];
}

export default function NewEquipmentOfferPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<EquipmentFormData>({
    title: '',
    category: '',
    condition: '',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    price: 0,
    priceType: 'fixed',
    description: '',
    specifications: [{ key: '', value: '' }],
    energyData: {
      powerDraw: 0,
      efficacy: 0,
      certification: ''
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    availability: {
      immediate: true,
      leadTime: 0,
      expirationDays: 30
    },
    shipping: {
      available: true,
      cost: 0,
      freeShippingThreshold: 0
    },
    warranty: {
      included: false,
      duration: 0,
      type: ''
    },
    images: [],
    documents: []
  });

  const categories = [
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'hvac', label: 'HVAC', icon: '❄️' },
    { value: 'controls', label: 'Control Systems', icon: '🎛️' },
    { value: 'sensors', label: 'Sensors', icon: '📡' },
    { value: 'irrigation', label: 'Irrigation', icon: '💧' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  const conditions = [
    { value: 'new', label: 'New', description: 'Brand new, never used' },
    { value: 'like_new', label: 'Like New', description: 'Used briefly, excellent condition' },
    { value: 'good', label: 'Good', description: 'Used, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Used, some wear but functional' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Only JPEG, PNG, and WebP files under 5MB are allowed.');
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 10) // Max 10 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(
          formData.title?.trim() && 
          formData.category && 
          formData.condition && 
          formData.brand?.trim() && 
          formData.model?.trim() &&
          formData.title.length >= 5 &&
          formData.title.length <= 100
        );
      case 2:
        return !!(
          formData.description?.trim() && 
          formData.description.length >= 20 &&
          formData.description.length <= 2000 &&
          formData.specifications.some(s => s.key?.trim() && s.value?.trim())
        );
      case 3:
        return !!(
          formData.price > 0 && 
          formData.price <= 1000000 &&
          formData.location.city?.trim() && 
          formData.location.state?.trim() &&
          formData.quantity > 0 &&
          formData.quantity <= 100
        );
      case 4:
        return formData.images.length > 0 && formData.images.length <= 10;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    // Final validation before submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      alert('Please complete all required fields before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add form data
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('brand', formData.brand);
      submitData.append('model', formData.model);
      submitData.append('serialNumber', formData.serialNumber);
      submitData.append('quantity', formData.quantity.toString());
      submitData.append('price', formData.price.toString());
      submitData.append('priceType', formData.priceType);
      submitData.append('description', formData.description);
      submitData.append('specifications', JSON.stringify(formData.specifications));
      submitData.append('energyData', JSON.stringify(formData.energyData));
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('shipping', JSON.stringify(formData.shipping));
      submitData.append('warranty', JSON.stringify(formData.warranty));
      
      // Add images
      formData.images.forEach((image, index) => {
        submitData.append(`image_${index}`, image);
      });
      
      // Add documents
      formData.documents.forEach((doc, index) => {
        submitData.append(`document_${index}`, doc);
      });
      
      // Submit to API
      const response = await fetch('/api/equipment/offers', {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Redirect to equipment offers page with success message
      router.push(`/equipment/offers?success=true&id=${result.id}`);
    } catch (error) {
      alert('Failed to submit equipment offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Listing Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Fluence SPYDR 2p LED Grow Lights - 10 Units"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(category => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.category === category.value
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-purple-500'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition *
              </label>
              <div className="space-y-3">
                {conditions.map(condition => (
                  <label
                    key={condition.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.condition === condition.value
                        ? 'bg-purple-600/20 border-purple-600'
                        : 'bg-gray-900/50 border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-white font-medium">{condition.label}</p>
                      <p className="text-sm text-gray-400">{condition.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Fluence"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., SPYDR 2p"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Details & Specifications</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the equipment, its condition, usage history, and any special features..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">
                  Technical Specifications *
                </label>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Specification
                </button>
              </div>
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      placeholder="e.g., PPF"
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="e.g., 1870 μmol/s"
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-3 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {(formData.category === 'lighting' || formData.category === 'hvac') && (
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Energy Efficiency Data
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Power Draw (W)
                    </label>
                    <input
                      type="number"
                      value={formData.energyData.powerDraw}
                      onChange={(e) => handleNestedInputChange('energyData', 'powerDraw', parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Efficacy (μmol/J)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.energyData.efficacy}
                      onChange={(e) => handleNestedInputChange('energyData', 'efficacy', parseFloat(e.target.value))}
                      placeholder="0.0"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Certification
                    </label>
                    <input
                      type="text"
                      value={formData.energyData.certification}
                      onChange={(e) => handleNestedInputChange('energyData', 'certification', e.target.value)}
                      placeholder="e.g., DLC Premium"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pricing & Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Type *
                </label>
                <select
                  value={formData.priceType}
                  onChange={(e) => handleInputChange('priceType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="negotiable">Negotiable</option>
                  <option value="auction">Auction</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-3">Location</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                  placeholder="Street Address (Optional)"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                    placeholder="City *"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleNestedInputChange('location', 'state', e.target.value)}
                    placeholder="State *"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={formData.location.zipCode}
                    onChange={(e) => handleNestedInputChange('location', 'zipCode', e.target.value)}
                    placeholder="ZIP Code"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Availability</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.availability.immediate}
                      onChange={(e) => handleNestedInputChange('availability', 'immediate', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">Available immediately</span>
                  </label>
                  {!formData.availability.immediate && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Lead Time (days)
                      </label>
                      <input
                        type="number"
                        value={formData.availability.leadTime}
                        onChange={(e) => handleNestedInputChange('availability', 'leadTime', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Listing expires in (days)
                    </label>
                    <input
                      type="number"
                      value={formData.availability.expirationDays}
                      onChange={(e) => handleNestedInputChange('availability', 'expirationDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3">Shipping</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.shipping.available}
                      onChange={(e) => handleNestedInputChange('shipping', 'available', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">Shipping available</span>
                  </label>
                  {formData.shipping.available && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Shipping cost ($)
                        </label>
                        <input
                          type="number"
                          value={formData.shipping.cost}
                          onChange={(e) => handleNestedInputChange('shipping', 'cost', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Free shipping over ($)
                        </label>
                        <input
                          type="number"
                          value={formData.shipping.freeShippingThreshold}
                          onChange={(e) => handleNestedInputChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Images & Documents</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment Images *
              </label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-300 mb-1">Click to upload images</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="documents"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="documents"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-300 mb-1">Upload manuals, spec sheets, etc.</p>
                  <p className="text-sm text-gray-500">PDF, DOC up to 25MB</p>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3">Warranty Information</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.warranty.included}
                    onChange={(e) => handleNestedInputChange('warranty', 'included', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Warranty included</span>
                </label>
                {formData.warranty.included && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Duration (months)
                      </label>
                      <input
                        type="number"
                        value={formData.warranty.duration}
                        onChange={(e) => handleNestedInputChange('warranty', 'duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        value={formData.warranty.type}
                        onChange={(e) => handleNestedInputChange('warranty', 'type', e.target.value)}
                        placeholder="e.g., Manufacturer"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/equipment/offers"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Equipment Offers
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">List Equipment</h1>
              <p className="text-gray-400">
                Create a listing to sell your cultivation equipment
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step >= stepNumber
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    step > stepNumber ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
          )}
          
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => router.push('/equipment/offers')}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!validateStep(step)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(4)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Listing
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-900/20 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Tips for a Successful Listing
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Include clear, high-quality photos from multiple angles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Be honest about the condition and any defects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Provide detailed specifications and energy efficiency data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Set competitive pricing based on market rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Respond promptly to inquiries to increase sale chances</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}