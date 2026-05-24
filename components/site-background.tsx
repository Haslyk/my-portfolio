"use client";

import { useEffect } from "react";

export function SiteBackground() {
  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 site-grid-bg" />
      <div className="absolute inset-0 site-grid-major" />
      <div className="absolute inset-0 site-vignette" />
      <div className="absolute inset-0 site-mouse-light" />
    </div>
  );
}
