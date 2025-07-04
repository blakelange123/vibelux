'use client';

import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Package, Zap, Info, ShoppingCart } from 'lucide-react';
import { ManufacturerFeaturedProducts, FeaturedProduct } from '@/lib/manufacturer/featured-products';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface FeaturedProductsPanelProps {
  placement?: 'sidebar' | 'carousel' | 'popup';
  category?: string;
}

export function FeaturedProductsPanel({ placement = 'sidebar', category }: FeaturedProductsPanelProps) {
  const { dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);

  useEffect(() => {
    // Load featured products
    const products = ManufacturerFeaturedProducts.getFeaturedProducts({
      placement,
      category,
      limit: placement === 'sidebar' ? 3 : 10
    });
    setFeaturedProducts(products);

    // Track impressions
    products.forEach(product => {
      ManufacturerFeaturedProducts.trackImpression(product.id);
    });
  }, [placement, category]);

  const handleProductClick = (product: FeaturedProduct) => {
    setSelectedProduct(product);
    ManufacturerFeaturedProducts.trackClick(product.id);
  };

  const handleAddToDesign = (product: FeaturedProduct) => {
    // Add the featured product as a fixture to the design
    dispatch({
      type: 'ADD_OBJECT',
      payload: {
        type: 'fixture',
        x: 10,
        y: 10,
        z: 8,
        width: 4,
        length: 4,
        height: 0.5,
        rotation: 0,
        model: {
          id: product.id,
          name: product.product.name,
          manufacturer: product.manufacturer.name,
          wattage: product.product.wattage,
          lumens: product.product.lumens,
          ppf: product.product.ppf,
          efficacy: product.product.efficacy,
          beamAngle: product.product.beamAngle,
          price: product.product.price?.msrp
        },
        enabled: true
      }
    });

    ManufacturerFeaturedProducts.trackDesignUse(product.id);
    showNotification('success', `Added ${product.product.name} to your design`);
    setSelectedProduct(null);
  };

  if (placement === 'sidebar') {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Featured Products</h3>
          <Star className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="space-y-3">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-white text-sm">{product.product.name}</h4>
                  <p className="text-xs text-gray-400">{product.manufacturer.name}</p>
                </div>
                {product.manufacturer.tier === 'platinum' && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    Premium
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>{product.product.wattage}W</span>
                <span>{product.product.efficacy} µmol/J</span>
              </div>

              {product.promotions && (
                <div className="mt-2 text-xs text-green-400">
                  {product.promotions.message}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All Featured Products →
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Featured Products Carousel/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              {product.product.image ? (
                <img
                  src={product.product.image}
                  alt={product.product.name}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.manufacturer.name}
                  </p>
                </div>
                {product.manufacturer.tier === 'platinum' && (
                  <Star className="w-5 h-5 text-yellow-500" />
                )}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Power</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.product.wattage}W
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Efficacy</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.product.efficacy} µmol/J
                  </p>
                </div>
                {product.product.ppf && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">PPF</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.product.ppf} µmol/s
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Beam Angle</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.product.beamAngle}°
                  </p>
                </div>
              </div>

              {/* Price & Promotion */}
              {product.product.price && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${product.product.price.msrp}
                      </span>
                      {product.promotions?.discount && (
                        <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                          {product.promotions.discount}% OFF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToDesign(product);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Add to Design
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedProduct.product.name}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {selectedProduct.manufacturer.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {selectedProduct.product.image ? (
                    <img
                      src={selectedProduct.product.image}
                      alt={selectedProduct.product.name}
                      className="object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <Package className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Technical Specifications
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Power Consumption</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.product.wattage}W
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Efficacy</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.product.efficacy} µmol/J
                      </dd>
                    </div>
                    {selectedProduct.product.ppf && (
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">PPF Output</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {selectedProduct.product.ppf} µmol/s
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Voltage</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.product.voltage}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Lifespan</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.product.lifespan.toLocaleString()} hours
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Warranty</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {selectedProduct.product.warranty} years
                      </dd>
                    </div>
                  </dl>

                  {/* Features */}
                  {selectedProduct.product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Key Features
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {selectedProduct.product.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedProduct.product.certifications.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.product.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <a
                    href={selectedProduct.manufacturer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Manufacturer
                  </a>
                  <button className="text-gray-600 hover:text-gray-700 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Request Info
                  </button>
                </div>
                
                <button
                  onClick={() => handleAddToDesign(selectedProduct)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}