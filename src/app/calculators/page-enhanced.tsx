"use client"

import Link from 'next/link'
import { 
  Calculator, 
  Lightbulb, 
  Sun, 
  Zap, 
  Clock, 
  TrendingUp,
  DollarSign,
  Leaf,
  Map,
  ArrowRight,
  Sparkles,
  Droplets,
  Wind,
  Grid3x3,
  BarChart3,
  Thermometer,
  Activity,
  Layers,
  Beaker,
  Calendar,
  Flower2,
  TreePine,
  Gauge
} from 'lucide-react'

export default function CalculatorsPageEnhanced() {
  const calculatorCategories = [
    {
      category: "Climate Control",
      icon: Thermometer,
      calculators: [
        {
          title: "Advanced VPD & Humidity Deficit",
          description: "Calculate VPD with humidity deficit targets for semi-closed greenhouses",
          icon: Thermometer,
          color: "from-purple-500/20 to-pink-500/20",
          borderColor: "border-purple-500/20",
          link: "/calculators/vpd-advanced",
          features: ["Humidity Deficit (HD)", "Semi-closed optimization", "24-hour climate strategy"],
          new: true,
          fromModulair: true
        },
        {
          title: "Psychrometric Calculator",
          description: "Calculate air properties and evaporative cooling potential",
          icon: Wind,
          color: "from-cyan-500/20 to-blue-500/20",
          borderColor: "border-cyan-500/20",
          link: "/calculators/psychrometric",
          features: ["Wet bulb temperature", "Cooling efficiency", "Pad wall sizing"],
          new: true,
          fromModulair: true
        },
        {
          title: "VPD Calculator",
          description: "Calculate vapor pressure deficit for optimal plant growth",
          icon: Droplets,
          color: "from-blue-500/20 to-cyan-500/20",
          borderColor: "border-blue-500/20",
          link: "/calculators/vpd",
          features: ["Real-time VPD", "Growth stage optimization", "Climate recommendations"]
        }
      ]
    },
    {
      category: "Lighting Design",
      icon: Sun,
      calculators: [
        {
          title: "Light Requirement Calculator",
          description: "Calculate daily light needs based on plant stage and fruit load",
          icon: Sun,
          color: "from-yellow-500/20 to-orange-500/20",
          borderColor: "border-yellow-500/20",
          link: "/calculators/light-requirements",
          features: ["Stage-based requirements", "Truss load calculation", "40-week crop cycle"],
          new: true,
          fromModulair: true
        },
        {
          title: "PPFD Heat Map",
          description: "Advanced 3D light distribution visualization with uniformity analysis",
          icon: Map,
          color: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/20",
          link: "/calculators/ppfd-map",
          features: ["3D visualization", "Uniformity metrics", "Multi-tier support"],
          premium: true
        },
        {
          title: "PPFD to DLI Converter",
          description: "Convert photon flux density to daily light integral",
          icon: Lightbulb,
          color: "from-purple-500/20 to-pink-500/20",
          borderColor: "border-purple-500/20",
          link: "/calculators/ppfd-dli",
          features: ["Interactive sliders", "Photoperiod optimization", "Crop recommendations"]
        },
        {
          title: "Coverage Area Calculator",
          description: "Calculate optimal fixture spacing and light coverage",
          icon: Grid3x3,
          color: "from-indigo-500/20 to-purple-500/20",
          borderColor: "border-indigo-500/20",
          link: "/calculators/coverage-area",
          features: ["Fixture spacing", "Overlap analysis", "Height optimization"]
        }
      ]
    },
    {
      category: "Water & Nutrients",
      icon: Droplets,
      calculators: [
        {
          title: "Light-Based Irrigation",
          description: "Calculate irrigation based on daily light integral and drain targets",
          icon: Droplets,
          color: "from-blue-500/20 to-teal-500/20",
          borderColor: "border-blue-500/20",
          link: "/calculators/irrigation",
          features: ["Light sum triggers", "EC management", "Drain percentage targets"],
          new: true,
          fromModulair: true
        },
        {
          title: "Nutrient Dosing Calculator",
          description: "Precision fertilizer calculations for optimal plant nutrition",
          icon: Beaker,
          color: "from-teal-500/20 to-green-500/20",
          borderColor: "border-teal-500/20",
          link: "/nutrient-dosing",
          features: ["Custom recipes", "EC/pH targets", "Tank mixing"]
        },
        {
          title: "Evaporative Cooling",
          description: "Calculate pad wall efficiency and water consumption",
          icon: Wind,
          color: "from-sky-500/20 to-blue-500/20",
          borderColor: "border-sky-500/20",
          link: "/calculators/evaporative-cooling",
          features: ["Cooling capacity", "Water usage", "Efficiency curves"],
          new: true,
          fromModulair: true
        }
      ]
    },
    {
      category: "Energy & Economics",
      icon: Zap,
      calculators: [
        {
          title: "Semi-Closed ROI Calculator",
          description: "Calculate return on investment for semi-closed greenhouse conversion",
          icon: TrendingUp,
          color: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/20",
          link: "/calculators/semi-closed-roi",
          features: ["Energy savings", "Yield improvements", "Payback period"],
          new: true,
          fromModulair: true
        },
        {
          title: "Heat Load Calculator",
          description: "Calculate greenhouse heating and cooling requirements",
          icon: Thermometer,
          color: "from-red-500/20 to-orange-500/20",
          borderColor: "border-red-500/20",
          link: "/calculators/heat-load",
          features: ["BTU calculations", "Zone analysis", "Equipment sizing"]
        },
        {
          title: "ROI Calculator",
          description: "Calculate return on investment for lighting upgrades",
          icon: DollarSign,
          color: "from-yellow-500/20 to-green-500/20",
          borderColor: "border-yellow-500/20",
          link: "/calculators/roi",
          features: ["Energy savings", "Yield increase", "Payback period"]
        },
        {
          title: "Energy Cost Calculator",
          description: "Estimate operational costs for your lighting system",
          icon: Zap,
          color: "from-orange-500/20 to-red-500/20",
          borderColor: "border-orange-500/20",
          link: "/calculators/energy-cost",
          features: ["kWh usage", "Demand charges", "Time-of-use rates"]
        }
      ]
    },
    {
      category: "Plant Science",
      icon: Leaf,
      calculators: [
        {
          title: "VeGe Balance Analyzer",
          description: "Analyze vegetative vs generative growth balance",
          icon: Activity,
          color: "from-lime-500/20 to-green-500/20",
          borderColor: "border-lime-500/20",
          link: "/calculators/vege-balance",
          features: ["Stem measurements", "Growth indicators", "Climate adjustments"],
          new: true,
          fromModulair: true
        },
        {
          title: "Plant Load Calculator",
          description: "Calculate optimal fruit load based on light and development",
          icon: TreePine,
          color: "from-green-500/20 to-teal-500/20",
          borderColor: "border-green-500/20",
          link: "/calculators/plant-load",
          features: ["Heat degree days", "Truss management", "Harvest predictions"],
          new: true,
          fromModulair: true
        },
        {
          title: "CO₂ Enrichment Calculator",
          description: "Optimize CO₂ levels for maximum photosynthesis",
          icon: Leaf,
          color: "from-emerald-500/20 to-teal-500/20",
          borderColor: "border-emerald-500/20",
          link: "/calculators/co2-enrichment",
          features: ["Photosynthesis rates", "Cost analysis", "Delivery methods"]
        },
        {
          title: "Photosynthetic Calculator",
          description: "Model photosynthesis based on environmental parameters",
          icon: Flower2,
          color: "from-pink-500/20 to-rose-500/20",
          borderColor: "border-pink-500/20",
          link: "/photosynthetic-calculator",
          features: ["Farquhar model", "Light response", "CO₂ response"]
        }
      ]
    },
    {
      category: "Greenhouse Systems",
      icon: Layers,
      calculators: [
        {
          title: "Air Exchange Optimizer",
          description: "Calculate optimal air exchange rates for different greenhouse types",
          icon: Wind,
          color: "from-slate-500/20 to-gray-500/20",
          borderColor: "border-slate-500/20",
          link: "/calculators/air-exchange",
          features: ["Semi-closed: 8-9/hr", "Pad-fan: 30-60/hr", "Energy comparison"],
          new: true,
          fromModulair: true
        },
        {
          title: "Shading Strategy Planner",
          description: "Optimize double screen configurations for light and temperature",
          icon: Gauge,
          color: "from-gray-500/20 to-zinc-500/20",
          borderColor: "border-gray-500/20",
          link: "/calculators/shading",
          features: ["Par-Perfect system", "60% shading capacity", "Energy savings"],
          new: true,
          fromModulair: true
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced Calculators
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade tools for greenhouse optimization, now enhanced with Advanced Dutch Research principles
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span>12 new calculators from advanced greenhouse research</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Categories */}
      <div className="container mx-auto px-4 py-12">
        {calculatorCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-gray-700">
                <category.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{category.category}</h2>
              {category.calculators.some(calc => calc.new) && (
                <span className="px-3 py-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full text-xs font-medium text-green-400 border border-green-500/30">
                  New Tools Available
                </span>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.calculators.map((calc, index) => (
                <Link key={index} href={calc.link} className="group">
                  <div className="relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${calc.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className={`relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl border ${calc.borderColor} overflow-hidden hover:border-opacity-50 transition-all`}>
                      <div className="p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                            <calc.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex gap-2">
                            {calc.new && (
                              <span className="px-2 py-1 bg-green-600/20 rounded-full text-xs font-medium text-green-400 border border-green-500/30">
                                New
                              </span>
                            )}
                            {calc.fromModulair && (
                              <span className="px-2 py-1 bg-purple-600/20 rounded-full text-xs font-medium text-purple-400 border border-purple-500/30">
                                Modulair
                              </span>
                            )}
                            {calc.premium && (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full text-xs font-medium text-yellow-400 border border-yellow-500/30">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">{calc.title}</h3>
                        <p className="text-sm text-gray-400 mb-4 flex-grow">{calc.description}</p>
                        
                        <div className="space-y-2">
                          {calc.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-1 h-1 bg-gray-600 rounded-full" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white group-hover:gap-3 transition-all">
                          <span>Open Calculator</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl border border-purple-500/20 p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need Custom Calculations?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our platform can integrate your specific greenhouse parameters and create custom calculators 
              tailored to your operation's unique requirements.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Request Custom Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}