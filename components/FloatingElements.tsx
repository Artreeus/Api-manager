'use client';

import { motion } from 'framer-motion';
import { Shield, Key, Lock, Eye, Zap } from 'lucide-react';

export function FloatingElements() {
  const elements = [
    { Icon: Shield, delay: 0, x: 100, y: 100 },
    { Icon: Key, delay: 0.5, x: -80, y: 150 },
    { Icon: Lock, delay: 1, x: 120, y: -100 },
    { Icon: Eye, delay: 1.5, x: -120, y: -80 },
    { Icon: Zap, delay: 2, x: 80, y: -150 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {elements.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10"
          initial={{ 
            x: x + window.innerWidth / 2, 
            y: y + window.innerHeight / 2,
            scale: 0,
            rotate: 0
          }}
          animate={{ 
            x: [x + window.innerWidth / 2, x + window.innerWidth / 2 + 50, x + window.innerWidth / 2],
            y: [y + window.innerHeight / 2, y + window.innerHeight / 2 - 30, y + window.innerHeight / 2],
            scale: [0, 1, 0.8],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Icon size={60} className="text-blue-500" />
        </motion.div>
      ))}
    </div>
  );
}