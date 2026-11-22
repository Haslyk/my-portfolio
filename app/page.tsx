"use client";

import { motion } from "framer-motion";
import { Linkedin, Mail, ExternalLink, Sparkles, Briefcase, Instagram } from "lucide-react";
import { AnimatedCanvasBackground } from "@/components/animated-canvas-background";
import { minimalConfig } from "@/data/minimal-config";

export default function MinimalHome() {
  const getIcon = (type: string) => {
    switch (type) {
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      case "bionluk":
        return <Briefcase className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "mail":
        return <Mail className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-teal-500/30 selection:text-teal-200 text-slate-100 overflow-hidden">
      {/* Animasyonlu etkileyici arkaplan */}
      <AnimatedCanvasBackground />

      {/* Üst Bar: Durum Rozeti */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="font-mono text-xs tracking-wider text-teal-400/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>PORTFOLIO</span>
        </div>

        {minimalConfig.status && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{minimalConfig.status.text}</span>
          </div>
        )}
      </header>

      {/* Ana İçerik: Minimal & Modern */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          {/* İsim & Soyisim */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm">
            {minimalConfig.name}
          </h1>

          {/* Ünvan / Rol */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-lg sm:text-2xl font-medium mb-6">
            {minimalConfig.titles.map((title, idx) => (
              <span key={title} className="flex items-center gap-2 sm:gap-3">
                <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent font-semibold">
                  {title}
                </span>
                {idx < minimalConfig.titles.length - 1 && (
                  <span className="text-slate-600 font-light select-none">/</span>
                )}
              </span>
            ))}
          </div>

          {/* Kısa Açıklama */}
          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed mb-8 font-normal">
            {minimalConfig.tagline}
          </p>

          {/* Butonlar & Bağlantılar */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            {minimalConfig.primaryAction && (
              <a
                href={minimalConfig.primaryAction.href}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(45,212,191,0.35)] hover:scale-[1.02] active:scale-95"
              >
                <span>{minimalConfig.primaryAction.label}</span>
                <Sparkles className="w-4 h-4 opacity-80 group-hover:rotate-12 transition-transform" />
              </a>
            )}

            {minimalConfig.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-teal-500/40 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm active:scale-95"
              >
                {getIcon(link.icon)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Alt Bilgi */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-8 pt-4 flex flex-col sm:flex-row items-center justify-center text-xs text-slate-500 gap-3 border-t border-white/[0.04]">
        <div>
          <span>© {new Date().getFullYear()} {minimalConfig.name}</span>
        </div>
        
      </footer>
    </div>
  );
}
