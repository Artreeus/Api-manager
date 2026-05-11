'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'cyber' | 'glow' | 'solar' | 'cosmic';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function AnimatedButton({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  onClick,
  disabled,
  type = 'button'
}: AnimatedButtonProps) {
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-blue-500/25',
    premium: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg hover:shadow-amber-500/25',
    cyber: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-cyan-500/25',
    glow: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
    solar: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 border-0 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]',
    cosmic: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 border-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-base h-11',
    lg: 'px-8 py-4 text-lg h-14'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative overflow-hidden text-white font-semibold',
          'transition-all duration-300 ease-out',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0',
          'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
          'backdrop-blur-sm',
          variants[variant],
          sizes[size],
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
          className
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </Button>
    </motion.div>
  );
}