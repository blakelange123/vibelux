'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Printer,
  Clock,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  Info,
  BookOpen
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  readTime: number;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  relatedArticles: Array<{
    id: string;
    title: string;
    category: string;
  }>;
}

// Mock article data - in production, this would come from an API
const mockArticles: Record<string, Article> = {
  '1': {
    id: '1',
    title: 'Quick Start Guide: Setting Up Your First Grow Room',
    content: `
# Quick Start Guide: Setting Up Your First Grow Room

Welcome to Vibelux! This guide will walk you through setting up your first grow room project and getting started with our platform.

## Prerequisites

Before you begin, make sure you have:
- A Vibelux account (sign up at vibelux.com)
- Basic room measurements
- Information about your current or planned lighting setup

## Step 1: Create a New Project

1. Log in to your Vibelux dashboard
2. Click the **"New Project"** button in the top right
3. Enter your project details:
   - Project name
   - Facility type (Indoor, Greenhouse, Vertical Farm)
   - Location (for climate data)
4. Click **"Create Project"**

> **💡 Pro Tip:** Use descriptive project names that include the room or facility identifier for easy organization.

## Step 2: Add Your First Room

Once your project is created:

1. Navigate to the **"Rooms"** tab
2. Click **"Add Room"**
3. Enter room specifications:
   - Room name
   - Dimensions (length, width, height)
   - Room type (Veg, Flower, Clone, etc.)
   - Target crop

### Important Room Measurements

Make sure to measure:
- **Canopy height**: The distance from your plants to the lights
- **Usable floor space**: Account for walkways and equipment
- **Ceiling height**: Important for fixture mounting calculations

## Step 3: Configure Lighting

The lighting configuration is crucial for accurate calculations:

1. Go to the **"Lighting"** section
2. Choose your fixture type:
   - Search our DLC database
   - Or add custom fixture specifications
3. Set mounting details:
   - Mounting height
   - Fixture spacing
   - Number of fixtures

### Understanding PPFD Requirements

Different growth stages require different light levels:
- **Clones/Seedlings**: 100-300 μmol/m²/s
- **Vegetative**: 300-600 μmol/m²/s
- **Flowering**: 600-1000 μmol/m²/s

## Step 4: Review Heat Map

After configuring your lighting:

1. Navigate to the **"Heat Map"** view
2. Review the PPFD distribution
3. Look for:
   - Even light distribution
   - No dark spots
   - Appropriate intensity levels

### Optimizing Light Distribution

If you notice issues:
- Adjust fixture spacing
- Modify mounting height
- Add or remove fixtures
- Consider different beam angles

## Step 5: Set Up Monitoring (Optional)

For real-time data tracking:

1. Go to **"Settings"** → **"Integrations"**
2. Connect your sensors or BMS system
3. Configure alert thresholds
4. Enable notifications

## Next Steps

Now that your first room is set up, you can:
- Add more rooms to your project
- Set up cultivation schedules
- Configure environmental targets
- Explore our marketplace
- Use advanced calculators

## Troubleshooting

### Common Issues

**Problem**: Heat map shows uneven distribution
**Solution**: Adjust fixture spacing or add more lights to dark areas

**Problem**: PPFD values seem too high/low
**Solution**: Verify fixture specifications and mounting height

**Problem**: Can't find my fixture model
**Solution**: Use the custom fixture option or contact support

## Get Help

If you need assistance:
- Use the in-app chat (bottom right)
- Email support@vibelux.com
- Join our community forum
- Schedule a demo call

---

**Related Articles:**
- Understanding PPFD and DLI Calculations
- Choosing the Right Fixtures for Your Facility
- Environmental Control Best Practices
    `,
    category: 'getting-started',
    author: 'Vibelux Team',
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    readTime: 5,
    views: 4521,
    helpful: 342,
    notHelpful: 12,
    tags: ['beginner', 'setup', 'grow-room', 'quick-start'],
    relatedArticles: [
      { id: '2', title: 'Understanding PPFD and DLI Calculations', category: 'cultivation' },
      { id: '3', title: 'Choosing the Right Fixtures', category: 'equipment' },
      { id: '4', title: 'Environmental Control Best Practices', category: 'cultivation' }
    ]
  }
};

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    const mockArticle = mockArticles[articleId];
    if (mockArticle) {
      setArticle(mockArticle);
    }
  }, [articleId]);

  const handleHelpfulVote = (vote: boolean) => {
    setHelpful(vote);
    // In production, send to API
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: 'Check out this article on Vibelux',
          url
        });
      } catch (err) {
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Article not found</p>
          <Link href="/help" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/help"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked ? 'bg-purple-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/help" className="hover:text-white transition-colors">
              Help Center
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/help/category/${article.category}`} className="hover:text-white transition-colors capitalize">
              {article.category.replace('-', ' ')}
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated {new Date(article.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {article.views.toLocaleString()} views
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Body - Sanitized for Security */}
        <div className="prose prose-invert max-w-none">
          <div 
            className="text-gray-300"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                article.content
                  .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-4 mt-8">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mb-3 mt-6">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-white mb-2 mt-4">$1</h3>')
                  .replace(/^> \*\*💡 (.*?)\*\* (.*$)/gim, '<div class="bg-purple-500/10 border-l-4 border-purple-500 p-4 my-4"><p class="text-purple-400 font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>$1</p><p class="text-gray-300 mt-1">$2</p></div>')
                  .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 my-4 text-gray-400">$1</blockquote>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                  .replace(/^- (.*$)/gim, '<li class="ml-6 my-1">$1</li>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^/g, '<p class="mb-4">')
                  .replace(/$/g, '</p>'),
                {
                  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'u', 'blockquote', 'li', 'ul', 'ol', 'div', 'span', 'br', 'svg', 'path'],
                  ALLOWED_ATTR: ['class', 'id', 'stroke', 'fill', 'viewBox', 'stroke-linecap', 'stroke-linejoin', 'stroke-width', 'd'],
                  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'meta'],
                  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
                }
              )
            }}
          />
        </div>

        {/* Helpful Section */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Was this article helpful?</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleHelpfulVote(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                helpful === true
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Yes ({article.helpful})
            </button>
            <button
              onClick={() => handleHelpfulVote(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                helpful === false
                  ? 'bg-red-500/20 text-red-400 border border-red-500'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              No ({article.notHelpful})
            </button>
          </div>
          
          {helpful !== null && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-300">
                {helpful 
                  ? 'Great! Thanks for your feedback.' 
                  : 'Sorry to hear that. Please contact our support team for additional help.'}
              </p>
              {!helpful && (
                <Link
                  href="/support/tickets/new"
                  className="inline-flex items-center gap-2 mt-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Related Articles */}
        {article.relatedArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-4">Related Articles</h3>
            <div className="grid gap-4">
              {article.relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/help/article/${related.id}`}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-sm text-gray-400 capitalize">
                        {related.category.replace('-', ' ')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-gray-300 mb-4">Our support team is here to assist you</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/support/tickets/new"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/community-forum"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Ask Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}