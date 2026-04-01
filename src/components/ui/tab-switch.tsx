"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
}

interface TabSwitchProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TabSwitch({ tabs, activeTab, onChange, className }: TabSwitchProps) {
  const [position, setPosition] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    const activeTabEl = tabsRef.current[activeIndex];
    if (activeTabEl) {
      setPosition({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.getBoundingClientRect().width,
      });
    }
  }, [activeIndex, activeTab]);

  return (
    <div
      className={`relative flex w-fit rounded-full border border-white/20 bg-white/5 backdrop-blur-xl p-1 ${className}`}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 px-5 py-2 text-sm font-semibold transition-colors duration-200 rounded-full ${
            activeTab === tab.id
              ? "text-earth-900"
              : "text-white/70 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <motion.div
        animate={{
          left: position.left,
          width: position.width,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="absolute z-0 top-1 bottom-1 rounded-full bg-white/90"
      />
    </div>
  );
}

export default TabSwitch;
