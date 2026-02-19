'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  velocityX: number;
  velocityY: number;
  rotationVelocity: number;
  shape: 'square' | 'circle' | 'triangle' | 'star';
}

const COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage
  '#FFEAA7', // Cream
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
];

interface ConfettiCelebrationProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
  className?: string;
}

export function ConfettiCelebration({
  active = true,
  duration = 4000,
  particleCount = 80,
  className = '',
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(active);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const shapes: Particle['shape'][] = ['square', 'circle', 'triangle', 'star'];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 30,
        y: 30 + Math.random() * 20,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        scale: 0.5 + Math.random() * 0.8,
        velocityX: (Math.random() - 0.5) * 15,
        velocityY: -8 - Math.random() * 12,
        rotationVelocity: (Math.random() - 0.5) * 20,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    setParticles(newParticles);
  }, [particleCount]);

  useEffect(() => {
    if (active) {
      setIsActive(true);
      createParticles();

      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, createParticles]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-50 ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            '--velocity-x': particle.velocityX,
            '--velocity-y': particle.velocityY,
            '--rotation-velocity': particle.rotationVelocity,
            animationDelay: `${Math.random() * 200}ms`,
            animationDuration: `${2500 + Math.random() * 1500}ms`,
          } as React.CSSProperties}
        >
          <ParticleShape
            shape={particle.shape}
            color={particle.color}
            scale={particle.scale}
            rotation={particle.rotation}
          />
        </div>
      ))}
    </div>
  );
}

function ParticleShape({
  shape,
  color,
  scale,
  rotation,
}: {
  shape: Particle['shape'];
  color: string;
  scale: number;
  rotation: number;
}) {
  const size = 10 * scale;

  const style: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  };

  switch (shape) {
    case 'circle':
      return (
        <div
          style={{
            ...style,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      );
    case 'triangle':
      return (
        <div
          style={{
            ...style,
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
          }}
        />
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <path
            fill={color}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    default:
      return (
        <div
          style={{
            ...style,
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      );
  }
}
