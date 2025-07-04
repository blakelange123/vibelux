'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUserPermissions, getCurrentUserRole } from '@/lib/user-permissions';
import { useState } from 'react';

interface NavigationProps {
  onClose?: () => void;
}

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const linkVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: -50,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export default function AnimatedNavigation({ onClose }: NavigationProps) {
  const pathname = usePathname();
  const permissions = getCurrentUserPermissions();
  const userRole = getCurrentUserRole();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/fixtures', label: 'Fixtures', permission: 'canAccessFixtures' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About' },
    { href: '/sensors', label: 'Sensors', permission: 'canAccessSensors' },
    { href: '/sensors/wireless', label: 'Wireless Sensors' },
    { href: '/predictions', label: 'Predictions', permission: 'canAccessPredictions' },
  ];

  const safeFeatures = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard-builder', label: 'Dashboard Builder' },
    { href: '/3d-visualization', label: '3D Visualization' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/design/advanced', label: 'Designer' },
    { href: '/collaboration-demo', label: 'Collaboration' },
    { href: '/battery-optimization', label: 'Battery Storage' },
    { href: '/demand-response', label: 'Demand Response' },
    { href: '/operations', label: 'Operations Center' },
    { href: '/cultivation/crop-steering', label: 'Crop Steering' },
    { href: '/automation/blueprints', label: 'Blueprints' },
  ];

  const toggleAdminMode = () => {
    if (typeof window !== 'undefined') {
      const current = localStorage.getItem('vibelux_admin_mode') === 'true';
      localStorage.setItem('vibelux_admin_mode', (!current).toString());
      window.location.reload();
    }
  };

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
    const isActive = pathname === href;
    const isHovered = hoveredLink === href;

    return (
      <motion.div
        variants={linkVariants}
        onHoverStart={() => setHoveredLink(href)}
        onHoverEnd={() => setHoveredLink(null)}
        className="relative"
      >
        <Link 
          href={href} 
          className={`block px-3 py-2 rounded-lg font-medium transition-colors relative overflow-hidden ${
            isActive
              ? 'text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => {
            onClick?.();
            onClose?.();
          }}
        >
          {/* Background animation */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 bg-purple-600 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </AnimatePresence>
          
          {/* Hover background */}
          <AnimatePresence>
            {isHovered && !isActive && (
              <motion.div
                className="absolute inset-0 bg-gray-800 rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          
          {/* Link content */}
          <span className="relative z-10 flex items-center justify-between">
            {label}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="h-full bg-gray-900 border-r border-gray-800"
      initial="closed"
      animate="open"
      exit="closed"
      variants={sidebarVariants}
    >
      {/* Sidebar Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-gray-800"
        variants={linkVariants}
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div 
            className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-lg font-bold text-white">Vibelux</span>
        </Link>
        
        {onClose && (
          <motion.button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            aria-label="Close sidebar"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>
      
      {/* Navigation Links */}
      <nav className="p-4">
        <motion.div className="space-y-2" variants={sidebarVariants}>
          {navLinks.map(link => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </motion.div>
        
        {/* Safe Features */}
        <motion.div 
          className="mt-8 pt-8 border-t border-gray-800 space-y-2"
          variants={sidebarVariants}
        >
          <motion.h3 
            className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
            variants={linkVariants}
          >
            Features
          </motion.h3>
          {safeFeatures.map(link => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </motion.div>
        
        {/* Unsafe Features Section */}
        <motion.div 
          className="mt-8 pt-8 border-t border-gray-800 space-y-2"
          variants={sidebarVariants}
        >
          <motion.div 
            className="flex items-center gap-2 px-3 py-1"
            variants={linkVariants}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Features
            </span>
          </motion.div>
          
          <motion.div variants={linkVariants}>
            <button
              onClick={toggleAdminMode}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-between group"
            >
              <span>Toggle Admin Mode</span>
              <motion.div
                className="text-xs text-gray-500 group-hover:text-gray-300"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
              >
                {userRole === 'admin' ? 'ON' : 'OFF'}
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </nav>
    </motion.div>
  );
}