'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Search,
  Filter,
  Star,
  DollarSign,
  Truck,
  FileText,
  Users,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  Minus,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { MarketplaceManager, Product, Vendor, GeneticListing } from '@/lib/marketplace/marketplace-manager';

const marketplaceManager = new MarketplaceManager();

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export function MarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState<'browse' | 'vendors' | 'genetics' | 'orders' | 'rfq' | 'cart'>('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [genetics, setGenetics] = useState<GeneticListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data
    loadProducts();
    loadVendors();
    loadGenetics();
    loadStats();

    // Subscribe to events
    marketplaceManager.on('productListed', loadProducts);
    marketplaceManager.on('vendorRegistered', loadVendors);
    marketplaceManager.on('geneticsListed', loadGenetics);

    return () => {
      marketplaceManager.removeListener('productListed', loadProducts);
      marketplaceManager.removeListener('vendorRegistered', loadVendors);
      marketplaceManager.removeListener('geneticsListed', loadGenetics);
    };
  }, []);

  const loadProducts = () => {
    const filters = selectedCategory === 'all' ? {} : { category: selectedCategory };
    setProducts(marketplaceManager.searchProducts({ ...filters, search: searchTerm }));
  };

  const loadVendors = () => {
    setVendors(marketplaceManager.searchVendors({ verified: true }));
  };

  const loadGenetics = () => {
    setGenetics(marketplaceManager.searchGenetics({}));
  };

  const loadStats = () => {
    setStats(marketplaceManager.getMarketplaceStats());
  };

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.productId === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevCart, { productId: product.id, product, quantity }];
        }
      });

      // TODO: Replace with actual API call when database is integrated
      // await fetch('/api/marketplace/cart', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId: product.id, quantity, price: product.pricing.list })
      // });
      
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Cart error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.pricing.list * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartItemCount = useCallback(() => cartItemCount, [cartItemCount]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'lighting', name: 'Lighting', icon: Package },
    { id: 'hvac', name: 'HVAC', icon: Package },
    { id: 'automation', name: 'Automation', icon: Package },
    { id: 'nutrients', name: 'Nutrients', icon: Package },
    { id: 'equipment', name: 'Equipment', icon: Package }
  ];

  return (
    <div className="marketplace-container min-h-screen bg-black text-white p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="marketplace-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">B2B Marketplace</h1>
          <p className="text-gray-400">Connect with verified suppliers and discover quality products</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => setShowCart(true)}
            className="relative px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
          <Link
            href="/marketplace/vendor-signup"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Become a Vendor
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="marketplace-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Vendors</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalVendors || 0}</div>
          <div className="text-sm text-green-400">Verified suppliers</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Products</span>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalProducts || 0}</div>
          <div className="text-sm text-gray-400">Available</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Genetics</span>
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalGenetics || 0}</div>
          <div className="text-sm text-gray-400">Strains</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Active Orders</span>
            <ShoppingCart className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">{stats.activeOrders || 0}</div>
          <div className="text-sm text-gray-400">In progress</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Open RFQs</span>
            <FileText className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold">{stats.openRFQs || 0}</div>
          <div className="text-sm text-gray-400">Awaiting quotes</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="marketplace-tabs flex flex-wrap gap-1 mb-6 bg-gray-900 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'browse', label: 'Browse Products', icon: Package },
          { id: 'vendors', label: 'Vendors', icon: Users },
          { id: 'genetics', label: 'Genetics', icon: Package },
          { id: 'orders', label: 'My Orders', icon: ShoppingCart },
          { id: 'rfq', label: 'RFQs', icon: FileText },
          { id: 'cart', label: `Cart (${getCartItemCount()})`, icon: ShoppingBag }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-300 hover:text-red-100"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Browse Products Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                aria-label="Search products in marketplace"
                role="searchbox"
              />
            </div>
            <button className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="marketplace-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => {
              const vendor = marketplaceManager.getVendor(product.vendorId);
              return (
                <div key={product.id} className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all">
                  <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-600" />
                    {product.availability === 'in-stock' && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                        In Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
                    
                    {vendor && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">by {vendor.name}</span>
                        {vendor.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-2xl font-bold">${product.pricing.list}</div>
                        {product.pricing.wholesale && (
                          <div className="text-sm text-gray-400">
                            Wholesale: ${product.pricing.wholesale}
                          </div>
                        )}
                      </div>
                      {vendor && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="marketplace-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{vendor.type} Supplier</p>
                </div>
                {vendor.verified && (
                  <div className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                    Verified
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{vendor.rating} ({vendor.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Min Order</span>
                  <span>${vendor.minimumOrder}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Payment</span>
                  <span>{vendor.paymentTerms}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.specialties.slice(0, 3).map((specialty, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-800 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View Catalog
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Genetics Tab */}
      {activeTab === 'genetics' && (
        <div className="marketplace-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {genetics.map(genetic => {
            const vendor = marketplaceManager.getVendor(genetic.vendorId);
            return (
              <div key={genetic.id} className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-600" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{genetic.strain}</h3>
                  <p className="text-sm text-gray-400 mb-3">{genetic.genetics.lineage}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-400">THC:</span>
                      <span className="ml-1">{genetic.genetics.thc.min}-{genetic.genetics.thc.max}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CBD:</span>
                      <span className="ml-1">{genetic.genetics.cbd.min}-{genetic.genetics.cbd.max}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Flower:</span>
                      <span className="ml-1">{genetic.genetics.floweringTime} weeks</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-1 capitalize">{genetic.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xl font-bold">${genetic.price}</div>
                      <div className="text-xs text-gray-400">per unit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{genetic.availability} available</div>
                      <div className="text-xs text-gray-400 capitalize">{genetic.licensing.type}</div>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Request Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6">Add some products to get started</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="bg-gray-900 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-400">{item.product.brand}</p>
                    <p className="text-lg font-bold text-white">${item.product.pricing.list}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      ${(item.product.pricing.list * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-white">${getCartTotal().toFixed(2)}</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-gray-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-white text-sm">{item.product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{item.product.brand}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-white font-medium">
                        ${(item.product.pricing.list * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-white">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <Link
          href="/equipment/offers"
          className="block p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Equipment Marketplace"
        >
          <Package className="w-5 h-5" />
        </Link>
        <Link
          href="/equipment-board"
          className="block p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Equipment Requests"
        >
          <BarChart3 className="w-5 h-5" />
        </Link>
        <button 
          onClick={() => {
            setActiveTab('browse');
          }}
          className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Browse Products"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}