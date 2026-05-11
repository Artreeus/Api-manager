'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'premium' | 'cyber' | 'solar' | 'cosmic';
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  variant = 'default'
}: GlassCardProps) {
  const variants = {
    default: 'bg-white/10 border-white/20 backdrop-blur-xl',
    premium: 'bg-gradient-to-br from-white/20 to-white/5 border-white/30 backdrop-blur-xl',
    cyber: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-400/30 backdrop-blur-xl',
    solar: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/30 backdrop-blur-xl',
    cosmic: 'bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 border-purple-400/30 backdrop-blur-xl'
  };

  const glowEffects = {
    default: 'shadow-[0_0_50px_rgba(59,130,246,0.3)]',
    premium: 'shadow-[0_0_50px_rgba(245,158,11,0.3)]',
    cyber: 'shadow-[0_0_50px_rgba(6,182,212,0.3)]',
    solar: 'shadow-[0_0_50px_rgba(251,191,36,0.3)]',
    cosmic: 'shadow-[0_0_50px_rgba(168,85,247,0.3)]'
  };

  return (
    <motion.div
      className={cn(
        'border rounded-2xl shadow-2xl',
        'transition-all duration-300 ease-out',
        variants[variant],
        hover && 'hover:bg-white/20 hover:border-white/40 hover:shadow-3xl hover:scale-[1.02]',
        glow && glowEffects[variant],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      } : undefined}
    >
      {children}
    </motion.div>
  );
}