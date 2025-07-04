'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface OperationsLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function OperationsLayout({ title, description, children }: OperationsLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Link 
            href="/operations"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Operations Center</span>
          </Link>
          <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
          <span className="text-sm text-purple-400">{title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}