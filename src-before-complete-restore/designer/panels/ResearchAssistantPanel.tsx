'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, BookOpen, FileText, Filter, X, Download, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cropDatabase } from '@/lib/crop-database';

interface ResearchPaper {
  title: string;
  link: string;
  doi?: string;
  year?: string;
  authors?: string;
  abstract?: string;
  tags?: string[];
  relevance?: number;
}

interface ResearchAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCrop?: string;
  currentPPFD?: number;
  currentDLI?: number;
}

export function ResearchAssistantPanel({
  isOpen,
  onClose,
  selectedCrop,
  currentPPFD,
  currentDLI
}: ResearchAssistantPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lighting' | 'environment' | 'nutrients' | 'propagation'>('all');
  const [expandedPapers, setExpandedPapers] = useState<Set<string>>(new Set());
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set());

  // Get research papers from crop database
  const cropResearchPapers = useMemo(() => {
    if (!selectedCrop) return [];
    
    // Find crop in the database object
    const crop = Object.values(cropDatabase).find(c => c.name === selectedCrop);
    if (!crop || !crop.sources) return [];
    
    return crop.sources.map(source => ({
      title: source.title,
      link: source.url || '',
      doi: source.doi,
      year: source.year,
      tags: ['lighting', 'crop-specific'],
      relevance: 100
    }));
  }, [selectedCrop]);

  // Additional curated research papers
  const curatedPapers: ResearchPaper[] = [
    {
      title: "Optimal Daily Light Integral for Indoor Cultivation of Leafy Vegetables and Herbs",
      link: "https://doi.org/10.21273/HORTSCI15398-20",
      doi: "10.21273/HORTSCI15398-20",
      year: "2021",
      authors: "Faust et al.",
      abstract: "This study examined optimal DLI ranges for various leafy greens and herbs under LED lighting...",
      tags: ["lighting", "DLI", "leafy-greens"],
      relevance: 95
    },
    {
      title: "Light Quality Effects on Intumescence Development in Tomato Plants",
      link: "https://doi.org/10.21273/JASHS04327-18",
      doi: "10.21273/JASHS04327-18",
      year: "2018",
      authors: "Eguchi et al.",
      abstract: "Investigation of UV and blue light ratios on physiological disorders in tomato seedlings...",
      tags: ["lighting", "tomato", "light-quality"],
      relevance: 88
    },
    {
      title: "Energy Efficiency of LED Lighting in Indoor Plant Production",
      link: "https://doi.org/10.1016/j.rser.2021.111857",
      doi: "10.1016/j.rser.2021.111857",
      year: "2021",
      authors: "Nelson & Bugbee",
      abstract: "Comprehensive review of LED efficiency metrics and their impact on crop production economics...",
      tags: ["lighting", "efficiency", "economics"],
      relevance: 92
    },
    {
      title: "Photosynthetic Photon Flux Density Effects on Growth and Development",
      link: "https://doi.org/10.21273/HORTSCI14109-19",
      doi: "10.21273/HORTSCI14109-19",
      year: "2019",
      authors: "Lopez & Runkle",
      abstract: "Effects of PPFD levels from 100-600 μmol/m²/s on various ornamental and edible crops...",
      tags: ["lighting", "PPFD", "growth"],
      relevance: 90
    }
  ];

  // Combine all papers
  const allPapers = [...cropResearchPapers, ...curatedPapers];

  // Filter papers based on search and category
  const filteredPapers = useMemo(() => {
    return allPapers.filter(paper => {
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
        paper.tags?.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }, [allPapers, searchQuery, selectedCategory]);

  // Toggle paper expansion
  const togglePaperExpansion = (title: string) => {
    const newExpanded = new Set(expandedPapers);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedPapers(newExpanded);
  };

  // Toggle saved papers
  const toggleSavedPaper = (title: string) => {
    const newSaved = new Set(savedPapers);
    if (newSaved.has(title)) {
      newSaved.delete(title);
    } else {
      newSaved.add(title);
    }
    setSavedPapers(newSaved);
  };

  // Generate research recommendations based on current design
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (currentPPFD && currentPPFD < 200) {
      recs.push({
        type: 'warning',
        message: 'Current PPFD is below recommended levels for most crops. Consider reviewing lighting research.',
        papers: filteredPapers.filter(p => p.tags?.includes('PPFD'))
      });
    }
    
    if (currentDLI && currentDLI < 10) {
      recs.push({
        type: 'warning',
        message: 'DLI is below optimal range. Review DLI research for your specific crop.',
        papers: filteredPapers.filter(p => p.tags?.includes('DLI'))
      });
    }
    
    return recs;
  }, [currentPPFD, currentDLI, filteredPapers]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Research Assistant</h2>
            {selectedCrop && (
              <span className="text-sm text-gray-400">for {selectedCrop}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research papers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'lighting', 'environment', 'nutrients', 'propagation'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="p-4 border-b border-gray-700 bg-yellow-500/10">
            <h3 className="text-sm font-medium text-yellow-400 mb-2">Recommendations</h3>
            {recommendations.map((rec, index) => (
              <div key={index} className="text-sm text-gray-300 mb-2">
                {rec.message}
              </div>
            ))}
          </div>
        )}

        {/* Research Papers List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredPapers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No research papers found matching your criteria.
              </div>
            ) : (
              filteredPapers.map((paper, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{paper.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        {paper.authors && <span>{paper.authors}</span>}
                        {paper.year && <span>{paper.year}</span>}
                        {paper.relevance && (
                          <span className="text-purple-400">{paper.relevance}% relevant</span>
                        )}
                      </div>
                      {paper.tags && (
                        <div className="flex gap-2 mt-2">
                          {paper.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSavedPaper(paper.title)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedPapers.has(paper.title)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                      {paper.abstract && (
                        <button
                          onClick={() => togglePaperExpansion(paper.title)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          {expandedPapers.has(paper.title) ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {expandedPapers.has(paper.title) && paper.abstract && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-300">{paper.abstract}</p>
                      {paper.doi && (
                        <div className="mt-2 text-xs text-gray-400">
                          DOI: {paper.doi}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {filteredPapers.length} papers found • {savedPapers.size} saved
          </div>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
            onClick={() => {
              // Export saved papers functionality
            }}
          >
            <Download className="w-4 h-4" />
            Export Saved
          </button>
        </div>
      </div>
    </div>
  );
}