'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
  tap?: boolean;
  stagger?: boolean;
  index?: number;
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
};

export function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  tap = true,
  stagger = false,
  index = 0,
  ...props 
}: AnimatedCardProps) {
  const animationProps = {
    initial: "hidden",
    animate: "visible",
    whileHover: hover ? "hover" : undefined,
    whileTap: tap ? "tap" : undefined,
    variants: cardVariants,
    transition: stagger ? { delay: index * 0.1 } : undefined
  };

  return (
    <motion.div 
      className={`glass-card rounded-xl ${className}`}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCardHeader({ 
  children, 
  className = '', 
  delay = 0,
  ...props 
}: AnimatedCardProps & { delay?: number }) {
  return (
    <motion.div 
      className={`p-6 pb-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCardTitle({ 
  children, 
  className = '', 
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.h3 
      className={`text-lg font-semibold text-white ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.h3>
  );
}

export function AnimatedCardDescription({ 
  children, 
  className = '', 
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.p 
      className={`text-sm text-gray-400 mt-1 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.p>
  );
}

export function AnimatedCardContent({ 
  children, 
  className = '', 
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div 
      className={`p-6 pt-0 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated Card Grid Container
export function AnimatedCardGrid({ 
  children, 
  className = '',
  stagger = true,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger ? 0.1 : 0,
            delayChildren: 0.2
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Loading Card Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`glass-card rounded-xl p-6 ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="space-y-3">
        <motion.div 
          className="h-4 bg-gray-700 rounded w-3/4"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1
          }}
        />
        <motion.div 
          className="h-3 bg-gray-700 rounded w-1/2"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        <motion.div 
          className="h-20 bg-gray-700 rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
      </div>
    </motion.div>
  );
}