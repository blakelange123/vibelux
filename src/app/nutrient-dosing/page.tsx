"use client"
import { useState } from 'react'
import { EnhancedNutrientCalculator } from '@/components/EnhancedNutrientCalculator'
import { FormulationCalculator } from '@/components/FormulationCalculator'
import { StageSpecificNutrients } from '@/components/StageSpecificNutrients'
import { NutrientDosingCalculator } from '@/components/NutrientDosingCalculator'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  FlaskRound,
  Calculator,
  Calendar,
  Beaker,
  TrendingUp,
  Info
} from 'lucide-react'

export default function NutrientDosingPage() {
  const [activeTab, setActiveTab] = useState('enhanced')
  const [customRecipes, setCustomRecipes] = useState([])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Advanced Nutrient Management System
          </h1>
          <p className="text-gray-400">
            Create custom nutrient recipes, calculate precise formulations, and manage stage-specific feeding programs
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-200 mb-1">Enhanced Features Available</h3>
              <ul className="text-sm text-blue-200/80 space-y-1">
                <li>• Create and save custom nutrient recipes with precise PPM targets</li>
                <li>• Import/export recipes in JSON format for sharing</li>
                <li>• Calculate optimal fertilizer formulations with tank separation</li>
                <li>• Design stage-specific nutrient programs with weekly adjustments</li>
                <li>• Support for 40+ crop types and extensive fertilizer database</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-gray-800">
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <FlaskRound className="w-4 h-4" />
              <span className="hidden sm:inline">Recipe Builder</span>
              <span className="sm:hidden">Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="formulation" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Formulation</span>
              <span className="sm:hidden">Formulate</span>
            </TabsTrigger>
            <TabsTrigger value="stages" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Growth Stages</span>
              <span className="sm:hidden">Stages</span>
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              <span className="hidden sm:inline">Classic Calculator</span>
              <span className="sm:hidden">Classic</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Recipe Builder Tab */}
          <TabsContent value="enhanced" className="mt-6">
            <EnhancedNutrientCalculator />
          </TabsContent>

          {/* Formulation Calculator Tab */}
          <TabsContent value="formulation" className="mt-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-2">
                  Formulation Calculator
                </h2>
                <p className="text-gray-400">
                  Calculate precise fertilizer amounts based on your custom recipes
                </p>
              </div>
              
              {/* Placeholder for formulation calculator integration */}
              <div className="text-center py-12 text-gray-400">
                <FlaskRound className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Select a recipe from the Recipe Builder tab first</p>
                <p className="text-sm mt-2">
                  Then return here to calculate the optimal fertilizer formulation
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Stage-Specific Nutrients Tab */}
          <TabsContent value="stages" className="mt-6">
            <StageSpecificNutrients 
              customRecipes={customRecipes}
              onSavePlan={(plan) => {
                console.log('Growth plan saved:', plan)
              }}
            />
          </TabsContent>

          {/* Classic Calculator Tab */}
          <TabsContent value="classic" className="mt-6">
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <Info className="w-5 h-5" />
                <p className="text-sm">
                  This is the original calculator. For advanced features, use the other tabs.
                </p>
              </div>
            </div>
            <NutrientDosingCalculator />
          </TabsContent>
        </Tabs>

        {/* Feature Comparison */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-400">Feature</th>
                  <th className="text-center py-2 px-4 text-gray-400">Classic</th>
                  <th className="text-center py-2 px-4 text-gray-400">Enhanced</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Pre-made Recipes</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Custom Recipe Creation</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Import/Export Recipes</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Extended Fertilizer Database</td>
                  <td className="text-center py-2 px-4">12 fertilizers</td>
                  <td className="text-center py-2 px-4">50+ fertilizers</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Tank Compatibility Checking</td>
                  <td className="text-center py-2 px-4">Basic</td>
                  <td className="text-center py-2 px-4">Advanced</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Stage-Specific Programs</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Recipe Validation</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2 px-4">Crop Types Supported</td>
                  <td className="text-center py-2 px-4">5</td>
                  <td className="text-center py-2 px-4">40+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-100">Create Recipe</h4>
            </div>
            <p className="text-sm text-gray-400">
              Start in the Recipe Builder tab to create a custom nutrient recipe with your target PPM values
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-100">Calculate Formulation</h4>
            </div>
            <p className="text-sm text-gray-400">
              Use the Formulation tab to calculate exact fertilizer amounts and check compatibility
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-100">Plan Growth Cycle</h4>
            </div>
            <p className="text-sm text-gray-400">
              Design stage-specific feeding programs with weekly adjustments in the Growth Stages tab
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}