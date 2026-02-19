"use client";

import React, { useState, useEffect, useRef, HTMLAttributes, useCallback } from 'react';
import { cn } from "@/lib/utils";

// Define the type for a single gallery item
export interface GalleryItem {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 450, autoRotateSpeed = 0.15, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragStartRef = useRef<{ x: number; rotation: number } | null>(null);

    const anglePerItem = 360 / items.length;

    // Update active index based on rotation
    const updateActiveIndex = useCallback((rot: number) => {
      const normalizedRotation = (((-rot) % 360) + 360) % 360;
      const index = Math.round(normalizedRotation / anglePerItem) % items.length;
      setActiveIndex(index);
    }, [anglePerItem, items.length]);

    // Effect for auto-rotation
    useEffect(() => {
      const autoRotate = () => {
        if (!isPaused && !isDragging) {
          setRotation(prev => {
            const newRotation = prev - autoRotateSpeed;
            updateActiveIndex(newRotation);
            return newRotation;
          });
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPaused, isDragging, autoRotateSpeed, updateActiveIndex]);

    // Mouse drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, rotation };
    }, [rotation]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const sensitivity = 0.3; // Adjust for faster/slower rotation
      const newRotation = dragStartRef.current.rotation + deltaX * sensitivity;

      setRotation(newRotation);
      updateActiveIndex(newRotation);
    }, [isDragging, updateActiveIndex]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      dragStartRef.current = null;
    }, []);

    const handleMouseLeave = useCallback(() => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
      }
      setIsPaused(false);
    }, [isDragging]);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      setIsDragging(true);
      setIsPaused(true);
      dragStartRef.current = { x: e.touches[0].clientX, rotation };
    }, [rotation]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const sensitivity = 0.3;
      const newRotation = dragStartRef.current.rotation + deltaX * sensitivity;

      setRotation(newRotation);
      updateActiveIndex(newRotation);
    }, [isDragging, updateActiveIndex]);

    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
      setIsPaused(false);
      dragStartRef.current = null;
    }, []);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-label="How It Works Carousel"
        className={cn(
          "relative w-full h-[500px] flex items-center justify-center select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
        style={{ perspective: '1500px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        <div
          className="relative w-full h-full pointer-events-none"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.4, 1 - (normalizedAngle / 180));
            const scale = Math.max(0.7, 1 - (normalizedAngle / 360));
            const isFront = normalizedAngle < 45;

            return (
              <div
                key={i}
                role="group"
                aria-label={item.title}
                className="absolute w-[280px] h-[350px] pointer-events-auto"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-140px',
                  marginTop: '-175px',
                  opacity: opacity,
                  transition: isDragging ? 'opacity 0.1s linear' : 'opacity 0.3s linear, transform 0.3s ease-out',
                  zIndex: isFront ? 10 : 1,
                }}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden group border border-white/10">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                  {/* Glowing effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-white/5" />

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col">
                    {/* Step number - top left */}
                    <div className="relative flex items-center justify-center w-12 h-12">
                      <div className="absolute inset-0 bg-white/10 rounded-xl" />
                      <div className="absolute inset-0.5 bg-earth-900/90 rounded-[10px]" />
                      <span className="relative text-xl font-black text-white/80">
                        {item.step}
                      </span>
                    </div>

                    {/* Centered Icon */}
                    <div className="flex-1 flex items-center justify-center -mt-4">
                      <div className="p-4">
                        {item.icon}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation dots */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "bg-primary-400 w-6"
                  : "bg-white/30 hover:bg-white/50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                const targetRotation = i * anglePerItem;
                setRotation(-targetRotation);
                setActiveIndex(i);
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Drag hint */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-xs flex items-center gap-2 z-10 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span>Drag to explore</span>
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
