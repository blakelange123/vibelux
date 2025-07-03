'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, Download, Star, Quote, Users, Calendar, 
  TrendingUp, Award, Shield, BookOpen
} from 'lucide-react';
import { ResearchPaper } from '@/lib/open-access-research';
import { format } from 'date-fns';

interface EnhancedPaperCardProps {
  paper: ResearchPaper;
  onSave?: (paper: ResearchPaper) => void;
  onRemove?: (paperId: string) => void;
  isSaved?: boolean;
  showEnhancements?: boolean;
}

export function EnhancedPaperCard({ 
  paper, 
  onSave, 
  onRemove, 
  isSaved = false,
  showEnhancements = true 
}: EnhancedPaperCardProps) {
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
      case 'gold': return 'bg-yellow-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'hybrid': return 'bg-blue-500 text-white';
      case 'bronze': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCitationLevel = (count?: number) => {
    if (!count) return { level: 'none', color: 'text-gray-500', icon: null };
    if (count < 10) return { level: 'emerging', color: 'text-blue-500', icon: BookOpen };
    if (count < 50) return { level: 'established', color: 'text-green-500', icon: TrendingUp };
    if (count < 100) return { level: 'influential', color: 'text-orange-500', icon: Award };
    return { level: 'highly_cited', color: 'text-red-500', icon: Shield };
  };

  const citationInfo = getCitationLevel(paper.citationCount);
  const CitationIcon = citationInfo.icon;

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1 mr-4">
            {paper.title}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => isSaved ? onRemove?.(paper.id) : onSave?.(paper)}
            >
              <Star className={`h-4 w-4 ${isSaved ? 'fill-yellow-400' : ''}`} />
            </Button>
            {paper.pdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Authors and Date */}
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{paper.authors.slice(0, 3).join(', ')}</span>
          {paper.authors.length > 3 && <span>et al.</span>}
        </div>

        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(paper.publishedDate, 'MMM yyyy')}</span>
          <span>•</span>
          <span>{paper.journal}</span>
          {paper.doi && (
            <>
              <span>•</span>
              <a 
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                DOI: {paper.doi}
              </a>
            </>
          )}
        </div>

        {/* Enhanced Metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={getOpenAccessBadgeColor(paper.openAccessType)}>
            {paper.openAccessType.toUpperCase()} OA
          </Badge>
          <Badge variant="outline">
            {getRepositoryIcon(paper.repository)} {paper.repository.toUpperCase()}
          </Badge>
          
          {showEnhancements && paper.citationCount !== undefined && (
            <Badge variant="outline" className={`${citationInfo.color} border-current`}>
              {CitationIcon && <CitationIcon className="h-3 w-3 mr-1" />}
              {paper.citationCount} citations
            </Badge>
          )}
          
          {paper.relevanceScore && (
            <Badge variant="outline">
              Relevance: {Math.round(paper.relevanceScore)}%
            </Badge>
          )}
        </div>

        {/* Abstract */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {paper.abstract}
        </p>

        {/* Keywords */}
        {paper.keywords.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {paper.keywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {paper.keywords.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{paper.keywords.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Citation Information */}
        {showEnhancements && paper.citationCount !== undefined && paper.citationCount > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Quote className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Citation Impact</span>
            </div>
            <p className="text-xs text-gray-600">
              This paper has been cited {paper.citationCount} times, indicating {' '}
              {citationInfo.level === 'none' && 'minimal impact'}
              {citationInfo.level === 'emerging' && 'emerging relevance in the field'}
              {citationInfo.level === 'established' && 'established influence in the research community'}
              {citationInfo.level === 'influential' && 'significant influence on agricultural lighting research'}
              {citationInfo.level === 'highly_cited' && 'exceptional impact as a highly-cited work'}
              .
            </p>
            {paper.citationCount >= 20 && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Validated by peer citations - reliable research source
              </p>
            )}
          </div>
        )}

        {/* Research Quality Indicators */}
        {showEnhancements && (
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {paper.doi && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>DOI Verified</span>
              </div>
            )}
            {paper.openAccessType === 'gold' && (
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>Gold OA</span>
              </div>
            )}
            {paper.citationCount && paper.citationCount > 10 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Well-Cited</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}