'use client';

import { motion } from 'framer-motion';

export default function FloatingBackground() {
  // Predefined positions to avoid Math.random() in render
  const shapes = [
    {
      color: 'from-blue-400/20 to-cyan-400/20',
      size: 'w-64 h-64',
      initialX: -30,
      initialY: 20,
      animateX: [-30, 10, -20],
      animateY: [20, -10, 15],
      left: '20%',
      top: '10%',
      duration: 20,
      delay: 0,
    },
    {
      color: 'from-purple-400/20 to-pink-400/20',
      size: 'w-96 h-96',
      initialX: 40,
      initialY: -25,
      animateX: [40, -20, 30],
      animateY: [-25, 15, -20],
      left: '35%',
      top: '30%',
      duration: 25,
      delay: 0.2,
    },
    {
      color: 'from-emerald-400/20 to-teal-400/20',
      size: 'w-80 h-80',
      initialX: -20,
      initialY: 40,
      animateX: [-20, 30, -10],
      animateY: [40, -20, 35],
      left: '50%',
      top: '50%',
      duration: 30,
      delay: 0.4,
    },
    {
      color: 'from-orange-400/20 to-red-400/20',
      size: 'w-72 h-72',
      initialX: 30,
      initialY: -15,
      animateX: [30, -10, 25],
      animateY: [-15, 25, -10],
      left: '65%',
      top: '70%',
      duration: 35,
      delay: 0.6,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          initial={{ 
            opacity: 0,
            x: shape.initialX,
            y: shape.initialY,
            rotate: 0
          }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            x: shape.animateX,
            y: shape.animateY,
            rotate: 360
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute ${shape.size} ${shape.color} blur-3xl rounded-full mix-blend-multiply`}
          style={{
            left: shape.left,
            top: shape.top,
          }}
        />
      ))}
    </div>
  );
}