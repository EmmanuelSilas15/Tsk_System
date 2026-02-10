'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedLayoutProps {
  children: ReactNode;
}

export default function AnimatedLayout({ children }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}