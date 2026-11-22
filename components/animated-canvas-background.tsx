"use client";

import { useEffect, useRef } from "react";

export function AnimatedCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking for interactive ripple/constellation
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 140,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Particles setup
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.8 + 1,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep glowing gradients
      const grad1 = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        Math.max(width, height) * 0.65
      );
      grad1.addColorStop(0, "rgba(20, 184, 166, 0.12)"); // cyan-teal glow
      grad1.addColorStop(0.4, "rgba(59, 130, 246, 0.05)"); // subtle indigo
      grad1.addColorStop(1, "rgba(10, 15, 29, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Ambient secondary ambient pulse
      const ambX = width * 0.8 + Math.sin(time) * 50;
      const ambY = height * 0.2 + Math.cos(time * 0.8) * 40;
      const grad2 = ctx.createRadialGradient(ambX, ambY, 0, ambX, ambY, 400);
      grad2.addColorStop(0, "rgba(147, 51, 234, 0.06)"); // subtle violet
      grad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap edges
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Distance to mouse effect
        const dxMouse = mouse.x - p1.x;
        const dyMouse = mouse.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          p1.alpha = p1.baseAlpha + (1 - distMouse / mouse.radius) * 0.5;
        } else {
          p1.alpha = p1.baseAlpha;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${p1.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const edgeAlpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${edgeAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0d14]">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Subtle fine grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Vignette border */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,13,20,0.85)_100%)]" />
    </div>
  );
}
