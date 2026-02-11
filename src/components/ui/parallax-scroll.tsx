"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const ParallaxScroll = ({
  children,
  className,
}: {
  children: [ReactNode[], ReactNode[], ReactNode[]]; // Three columns of children
  className?: string;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ["start start", "end start"],
  });

  // Straight parallax - no rotation, just Y movement
  const translateYFirst = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const translateYThird = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const [firstColumn, secondColumn, thirdColumn] = children;

  return (
    <div
      className={cn("h-[calc(100vh-12rem)] overflow-y-auto w-full", className)}
      ref={gridRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-7xl mx-auto gap-6 py-10 px-4 sm:px-6 lg:px-8">
        {/* First column - moves up */}
        <div className="grid gap-6">
          {firstColumn.map((child, idx) => (
            <motion.div
              style={{ y: translateYFirst }}
              key={"col-1-" + idx}
            >
              {child}
            </motion.div>
          ))}
        </div>

        {/* Second column - static */}
        <div className="grid gap-6">
          {secondColumn.map((child, idx) => (
            <motion.div key={"col-2-" + idx}>
              {child}
            </motion.div>
          ))}
        </div>

        {/* Third column - moves up */}
        <div className="grid gap-6">
          {thirdColumn.map((child, idx) => (
            <motion.div
              style={{ y: translateYThird }}
              key={"col-3-" + idx}
            >
              {child}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simpler version that takes items and a render function
export const ParallaxGrid = <T,>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ["start start", "end start"],
  });

  const translateYFirst = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const translateYThird = useTransform(scrollYProgress, [0, 1], [0, -120]);

  // Split items into three columns
  const third = Math.ceil(items.length / 3);
  const firstPart = items.slice(0, third);
  const secondPart = items.slice(third, 2 * third);
  const thirdPart = items.slice(2 * third);

  return (
    <div
      className={cn("h-[calc(100vh-14rem)] overflow-y-auto w-full scrollbar-thin", className)}
      ref={gridRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-7xl mx-auto gap-6 py-8">
        {/* First column */}
        <div className="grid gap-6">
          {firstPart.map((item, idx) => (
            <motion.div
              style={{ y: translateYFirst }}
              key={"col-1-" + idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {renderItem(item, idx)}
            </motion.div>
          ))}
        </div>

        {/* Second column - static for contrast */}
        <div className="grid gap-6 mt-12">
          {secondPart.map((item, idx) => (
            <motion.div 
              key={"col-2-" + idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (third + idx) * 0.05 }}
            >
              {renderItem(item, third + idx)}
            </motion.div>
          ))}
        </div>

        {/* Third column */}
        <div className="grid gap-6">
          {thirdPart.map((item, idx) => (
            <motion.div
              style={{ y: translateYThird }}
              key={"col-3-" + idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (2 * third + idx) * 0.05 }}
            >
              {renderItem(item, 2 * third + idx)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
