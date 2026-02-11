"use client";

import { useEffect } from "react";
import { renderCanvas, stopCanvas } from "@/components/ui/canvas";

export default function HeroShader() {
  useEffect(() => {
    renderCanvas();
    return () => {
      stopCanvas();
    };
  }, []);

  return (
    <canvas
      className="pointer-events-none absolute inset-0 h-full w-full"
      id="canvas"
    />
  );
}
