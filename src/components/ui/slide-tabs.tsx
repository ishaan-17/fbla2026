"use client"

import React, { useRef, useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  label: string;
  href: string;
}

interface Position {
  left: number;
  width: number;
  opacity: number;
}

interface SlideTabsProps {
  tabs: TabItem[];
  className?: string;
}

export const SlideTabs = ({ tabs, className }: SlideTabsProps) => {
  const pathname = usePathname();
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [hovered, setHovered] = useState<number | null>(null);
  
  const activeIndex = tabs.findIndex(tab => tab.href === pathname);
  const [selected, setSelected] = useState(activeIndex >= 0 ? activeIndex : 0);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.href === pathname);
    if (newIndex >= 0) {
      setSelected(newIndex);
    }
  }, [pathname, tabs]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  const resetToSelected = () => {
    setHovered(null);
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  };

  return (
    <ul
      onMouseLeave={resetToSelected}
      className={`relative flex w-fit rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-xl p-1 ${className}`}
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab.href}
          ref={(el) => { tabsRef.current[i] = el; }}
          href={tab.href}
          isActive={hovered === i || (hovered === null && selected === i)}
          setPosition={setPosition}
          onHover={() => setHovered(i)}
          onClick={() => setSelected(i)}
        >
          {tab.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  href: string;
  isActive: boolean;
  setPosition: (pos: Position) => void;
  onHover: () => void;
  onClick: () => void;
}

const Tab = forwardRef<HTMLLIElement, TabProps>(
  ({ children, href, isActive, setPosition, onHover, onClick }, ref) => {
    const internalRef = useRef<HTMLLIElement>(null);
    
    const setRefs = (el: HTMLLIElement | null) => {
      internalRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    return (
      <li
        ref={setRefs}
        onClick={onClick}
        onMouseEnter={() => {
          onHover();
          if (!internalRef.current) return;
          const { width } = internalRef.current.getBoundingClientRect();
          setPosition({
            left: internalRef.current.offsetLeft,
            width,
            opacity: 1,
          });
        }}
        className="relative z-10 block cursor-pointer"
      >
        <Link
          href={href}
          className={`block px-3 py-1.5 text-xs font-semibold uppercase md:px-5 md:py-2 md:text-sm tracking-wide transition-colors duration-200 ${
            isActive ? "text-earth-900" : "text-white/80"
          }`}
        >
          {children}
        </Link>
      </li>
    );
  }
);

Tab.displayName = "Tab";

interface CursorProps {
  position: Position;
}

const Cursor = ({ position }: CursorProps) => {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="absolute z-0 top-1 bottom-1 rounded-full bg-white/90"
    />
  );
};

export default SlideTabs;
