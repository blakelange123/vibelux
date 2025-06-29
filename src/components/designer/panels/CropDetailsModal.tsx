'use client';

import React from 'react';
import { X, Thermometer, Droplets, Clock, Zap, BookOpen, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { CropData, generateResearchLink } from '@/lib/crop-database';

interface CropDetailsModalProps {
  crop: CropData;
  isOpen: boolean;
  onClose: () => void;
}

export function CropDetailsModal({ crop, isOpen, onClose }: CropDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{crop.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{crop.scientificName}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-md">
              {crop.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* DLI & PPFD Requirements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Daily Light Integral</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Minimum:</span>
                  <span className="font-medium">{crop.dli.min} mol·m⁻²·d⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Optimal:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{crop.dli.optimal} mol·m⁻²·d⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maximum:</span>
                  <span className="font-medium">{crop.dli.max} mol·m⁻²·d⁻¹</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">PPFD Range</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Minimum:</span>
                  <span className="font-medium">{crop.ppfd.min} μmol·m⁻²·s⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Optimal:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{crop.ppfd.optimal} μmol·m⁻²·s⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maximum:</span>
                  <span className="font-medium">{crop.ppfd.max} μmol·m⁻²·s⁻¹</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Temperature</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Day:</div>
                  <div className="font-medium">{crop.temperature.day.optimal}°F ({crop.temperature.day.min}-{crop.temperature.day.max}°F)</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Night:</div>
                  <div className="font-medium">{crop.temperature.night.optimal}°F ({crop.temperature.night.min}-{crop.temperature.night.max}°F)</div>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Humidity</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Day:</div>
                  <div className="font-medium">{crop.humidity.day.optimal}% ({crop.humidity.day.min}-{crop.humidity.day.max}%)</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Night:</div>
                  <div className="font-medium">{crop.humidity.night.optimal}% ({crop.humidity.night.min}-{crop.humidity.night.max}%)</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Photoperiod</h4>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-medium">{crop.photoperiod.hours} hours</div>
                <div className="text-gray-600 dark:text-gray-400 capitalize">{crop.photoperiod.type.replace('-', ' ')}</div>
              </div>
            </div>
          </div>

          {/* Light Spectrum */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Optimal Light Spectrum</h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center">
                <div className="w-full h-3 bg-red-500 rounded-full mb-1" style={{ opacity: crop.spectrum.red / 100 }}></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Red</div>
                <div className="text-xs text-gray-500">{crop.spectrum.red}%</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-blue-500 rounded-full mb-1" style={{ opacity: crop.spectrum.blue / 100 }}></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Blue</div>
                <div className="text-xs text-gray-500">{crop.spectrum.blue}%</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-green-500 rounded-full mb-1" style={{ opacity: crop.spectrum.green / 100 }}></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Green</div>
                <div className="text-xs text-gray-500">{crop.spectrum.green}%</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-red-800 rounded-full mb-1" style={{ opacity: crop.spectrum.farRed / 100 }}></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Far-Red</div>
                <div className="text-xs text-gray-500">{crop.spectrum.farRed}%</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-purple-500 rounded-full mb-1" style={{ opacity: crop.spectrum.uv / 100 }}></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">UV</div>
                <div className="text-xs text-gray-500">{crop.spectrum.uv}%</div>
              </div>
            </div>
          </div>

          {/* Growth Stages */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Growth Stages</h3>
            <div className="space-y-3">
              {Object.entries(crop.growthStages).map(([stage, data]) => (
                <div key={stage} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white capitalize">
                      {stage.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {data.duration} days
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      DLI: {data.dli}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      PPFD: {data.ppfd}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {crop.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Important Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{crop.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Sources */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Scientific References</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                {crop.sources.length} studies
              </span>
            </div>
            <div className="space-y-3">
              {crop.sources.map((source, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                        {source.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {source.authors}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{source.journal}</span>
                        <span>•</span>
                        <span>{source.year}</span>
                        {source.doi && (
                          <>
                            <span>•</span>
                            <span className="font-mono">DOI: {source.doi}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <a
                      href={generateResearchLink(source)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors text-xs font-medium"
                      title="Open research paper"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <BookOpen className="w-3 h-3" />
                <span className="font-medium">Research-Backed Data:</span>
                <span>All lighting parameters are derived from peer-reviewed scientific publications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}