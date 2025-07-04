'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Download, ExternalLink, Star, Calendar, Users, 
  FileText, BookOpen, Database, Filter, SortAsc, Zap 
} from 'lucide-react';
import { ResearchPaper, OpenAccessResearchClient, AGRICULTURAL_SEARCH_QUERIES, getCuratedResearch } from '@/lib/open-access-research';
import { EnhancedPaperCard } from './EnhancedPaperCard';
import { format } from 'date-fns';

interface OpenAccessResearchLibraryProps {
  facilityId?: string;
  currentContext?: {
    cropType?: string;
    lightingType?: string;
    researchArea?: string;
  };
}

export function OpenAccessResearchLibrary({ facilityId, currentContext }: OpenAccessResearchLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [savedPapers, setSavedPapers] = useState<ResearchPaper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [filterRepository, setFilterRepository] = useState<string>('all');
  const [showEnhancements, setShowEnhancements] = useState<boolean>(true);

  const client = new OpenAccessResearchClient();

  useEffect(() => {
    // Load saved papers from localStorage
    const saved = localStorage.getItem('vibelux_saved_papers');
    if (saved) {
      setSavedPapers(JSON.parse(saved));
    }

    // Load context-relevant papers on mount
    if (currentContext?.cropType || currentContext?.lightingType) {
      loadContextualResearch();
    }
  }, [currentContext]);

  const loadContextualResearch = async () => {
    setIsSearching(true);
    try {
      let query = '';
      if (currentContext?.cropType) {
        query += `${currentContext.cropType} cultivation `;
      }
      if (currentContext?.lightingType) {
        query += `${currentContext.lightingType} lighting `;
      }
      query += 'horticulture';

      const results = await client.searchPapers(query);
      setPapers(results.slice(0, 20)); // Limit to 20 most relevant
    } catch (error) {
      console.error('Error loading contextual research:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await client.searchPapers(searchQuery);
      setPapers(results);
    } catch (error) {
      console.error('Error searching papers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadCuratedResearch = async (category: keyof typeof AGRICULTURAL_SEARCH_QUERIES) => {
    setIsSearching(true);
    try {
      const results = await getCuratedResearch(category);
      setPapers(results);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error loading curated research:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const savePaper = (paper: ResearchPaper) => {
    const updated = [...savedPapers, paper];
    setSavedPapers(updated);
    localStorage.setItem('vibelux_saved_papers', JSON.stringify(updated));
  };

  const removeSavedPaper = (paperId: string) => {
    const updated = savedPapers.filter(p => p.id !== paperId);
    setSavedPapers(updated);
    localStorage.setItem('vibelux_saved_papers', JSON.stringify(updated));
  };

  const isPaperSaved = (paperId: string) => {
    return savedPapers.some(p => p.id === paperId);
  };

  const getFilteredAndSortedPapers = (paperList: ResearchPaper[]) => {
    let filtered = paperList;

    // Filter by repository
    if (filterRepository !== 'all') {
      filtered = filtered.filter(p => p.repository === filterRepository);
    }

    // Sort papers
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
        break;
      case 'citations':
        filtered.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
        break;
      case 'relevance':
      default:
        filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        break;
    }

    return filtered;
  };

  const getRepositoryIcon = (repository: string) => {
    switch (repository) {
      case 'arxiv': return '📄';
      case 'biorxiv': return '🧬';
      case 'doaj': return '📚';
      case 'pmc': return '🏥';
      case 'core': return '🔬';
      case 'semantic_scholar': return '🎓';
      case 'researchgate': return '🔬';
      default: return '📖';
    }
  };

  const getOpenAccessBadgeColor = (type: string) => {
    switch (type) {
      case 'gold': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      case 'hybrid': return 'bg-blue-500';
      case 'bronze': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Open Access Research Library
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnhancements(!showEnhancements)}
              className="flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              {showEnhancements ? 'Hide' : 'Show'} Citations
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="curated">Curated Topics</TabsTrigger>
            <TabsTrigger value="saved">Saved Papers ({savedPapers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search agricultural research papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters and Sorting */}
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="citations">Sort by Citations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRepository} onValueChange={setFilterRepository}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  <SelectItem value="arxiv">ArXiv</SelectItem>
                  <SelectItem value="biorxiv">bioRxiv</SelectItem>
                  <SelectItem value="doaj">DOAJ</SelectItem>
                  <SelectItem value="pmc">PMC</SelectItem>
                  <SelectItem value="core">CORE</SelectItem>
                  <SelectItem value="semantic_scholar">Semantic Scholar</SelectItem>
                  <SelectItem value="researchgate">ResearchGate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Results */}
            {isSearching ? (
              <div className="text-center py-8">
                <Database className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Searching open access repositories...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredAndSortedPapers(papers).map(paper => (
                  <EnhancedPaperCard 
                    key={paper.id} 
                    paper={paper}
                    onSave={savePaper}
                    onRemove={removeSavedPaper}
                    isSaved={isPaperSaved(paper.id)}
                    showEnhancements={showEnhancements}
                  />
                ))}
                {papers.length === 0 && searchQuery && (
                  <p className="text-center text-muted-foreground py-8">
                    No papers found. Try different search terms.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="curated" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(AGRICULTURAL_SEARCH_QUERIES).map(([key, query]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => loadCuratedResearch(key as keyof typeof AGRICULTURAL_SEARCH_QUERIES)}
                  className="text-sm"
                  disabled={isSearching}
                >
                  {key.replace(/_/g, ' ').toLowerCase()}
                </Button>
              ))}
            </div>

            {selectedCategory !== 'all' && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedCategory.replace(/_/g, ' ').toLowerCase()} Research
                </h3>
                <div className="space-y-4">
                  {getFilteredAndSortedPapers(papers).map(paper => (
                    <EnhancedPaperCard 
                      key={paper.id} 
                      paper={paper}
                      onSave={savePaper}
                      onRemove={removeSavedPaper}
                      isSaved={isPaperSaved(paper.id)}
                      showEnhancements={showEnhancements}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedPapers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No saved papers yet</p>
                <p className="text-sm text-muted-foreground">
                  Use the star button to save papers for later reading
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredAndSortedPapers(savedPapers).map(paper => (
                  <EnhancedPaperCard 
                    key={paper.id} 
                    paper={paper}
                    onSave={savePaper}
                    onRemove={removeSavedPaper}
                    isSaved={isPaperSaved(paper.id)}
                    showEnhancements={showEnhancements}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}