"use client"

import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface ScrollFloatProps {
  children: string;
  containerClassName?: string;
  textClassName?: string;
  stagger?: number;
  duration?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  containerClassName = '',
  textClassName = '',
  stagger = 0.03,
  duration = 0.6,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  const characters = useMemo(() => {
    return children.split('');
  }, [children]);

  return (
    <span 
      ref={containerRef} 
      className={`overflow-hidden inline-block ${containerClassName}`}
    >
      <span className={`inline-block ${textClassName}`}>
        {characters.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ 
              opacity: 0, 
              y: '120%',
              scaleY: 2.3,
              scaleX: 0.7,
            }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0,
              scaleY: 1,
              scaleX: 1,
            } : {}}
            transition={{
              duration: duration,
              delay: index * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: '50% 0%' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
};

export default ScrollFloat;
