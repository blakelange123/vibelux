'use client';

import React from 'react';
import {
  Award, Shield, Star, Trophy, Zap, CheckCircle,
  TrendingUp, Clock, Calendar, Download, Share2, ExternalLink
} from 'lucide-react';

interface CertificationBadgeProps {
  certification: {
    id: string;
    title: string;
    category: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    issuedDate: Date;
    expiresDate: Date;
    score: number;
    moduleCount: number;
    skills: string[];
    verificationCode: string;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function CertificationBadge({
  certification,
  size = 'medium',
  showDetails = false,
  onShare,
  onDownload
}: CertificationBadgeProps) {
  const getLevelConfig = () => {
    switch (certification.level) {
      case 'platinum':
        return {
          gradient: 'from-slate-300 to-slate-400',
          borderColor: 'border-slate-400',
          icon: Trophy,
          label: 'Platinum'
        };
      case 'gold':
        return {
          gradient: 'from-yellow-400 to-yellow-500',
          borderColor: 'border-yellow-500',
          icon: Trophy,
          label: 'Gold'
        };
      case 'silver':
        return {
          gradient: 'from-gray-300 to-gray-400',
          borderColor: 'border-gray-400',
          icon: Star,
          label: 'Silver'
        };
      case 'bronze':
        return {
          gradient: 'from-orange-400 to-orange-500',
          borderColor: 'border-orange-500',
          icon: Shield,
          label: 'Bronze'
        };
    }
  };

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const levelConfig = getLevelConfig();
  const Icon = levelConfig.icon;

  const daysUntilExpiry = Math.ceil(
    (certification.expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysUntilExpiry <= 30;

  if (!showDetails) {
    return (
      <div className={`relative ${sizeClasses[size]} group cursor-pointer`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${levelConfig.gradient} rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
        <div className={`relative w-full h-full bg-gradient-to-br ${levelConfig.gradient} rounded-full border-4 ${levelConfig.borderColor} shadow-xl flex items-center justify-center`}>
          <Icon className={`${size === 'small' ? 'w-10 h-10' : size === 'medium' ? 'w-16 h-16' : 'w-24 h-24'} text-white drop-shadow-lg`} />
        </div>
        {certification.level === 'platinum' && (
          <div className="absolute -top-2 -right-2">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className={`bg-gradient-to-r ${levelConfig.gradient} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30 flex items-center justify-center`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              {certification.level === 'platinum' && (
                <div className="absolute -top-1 -right-1">
                  <Zap className="w-5 h-5 text-yellow-300" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{certification.title}</h3>
              <p className="text-white/80 capitalize">{levelConfig.label} Certification</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{certification.score}%</p>
            <p className="text-xs text-gray-400">Score</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{certification.moduleCount}</p>
            <p className="text-xs text-gray-400">Modules</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{certification.skills.length}</p>
            <p className="text-xs text-gray-400">Skills</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Certified Skills</h4>
          <div className="flex flex-wrap gap-2">
            {certification.skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Issued</span>
            </div>
            <p className="text-white">{certification.issuedDate.toLocaleDateString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span>Expires</span>
            </div>
            <p className={`font-medium ${isExpiringSoon ? 'text-yellow-400' : 'text-white'}`}>
              {certification.expiresDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
            <p className="text-sm text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Expires in {daysUntilExpiry} days - Renew soon!
            </p>
          </div>
        )}

        {/* Verification */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Verification Code</p>
              <p className="font-mono text-sm text-gray-300">{certification.verificationCode}</p>
            </div>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Verify
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}