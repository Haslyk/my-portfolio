"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, BriefcaseBusiness, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { fadeUp, stagger } from "@/lib/motion";

function TypingEffect({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const current = words[wordIndex];
    if (!deleting && displayed === current) {
      timeout.current = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed === "") {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timeout.current = setTimeout(
        () =>
          setDisplayed((d) =>
            deleting ? d.slice(0, -1) : current.slice(0, d.length + 1)
          ),
        deleting ? 40 : 80
      );
    }
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [displayed, deleting, wordIndex, words]);

  return (
    <span className="text-primary glow-cyan-text">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function TerminalCard({ lines }: { lines: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-xl overflow-hidden cyan-border max-w-sm w-full"
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">terminal</span>
      </div>
      <div className="p-4 font-mono text-sm space-y-1">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 + i * 0.15, duration: 0.3 }}
            className={
              i % 2 === 0
                ? "text-primary/80"
                : "text-foreground/70"
            }
          >
            {line}
          </motion.p>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-primary animate-pulse"
        >
          ▊
        </motion.span>
      </div>
    </motion.div>
  );
}

// Floating code snippet
function FloatingSnippet({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 1 }}
      className={`absolute hidden xl:block font-mono text-xs text-muted-foreground/30 pointer-events-none select-none ${className}`}
    >
      {code}
    </motion.div>
  );
}

export function Hero() {
  const { t } = useI18n();

  const scrollToProjects = () =>
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () =>
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating snippets */}
      <FloatingSnippet
        code={`const dev = {\n  name: "Halim",\n  passion: "code"\n};`}
        className="top-1/4 left-8 leading-relaxed"
      />
      <FloatingSnippet
        code={`function build() {\n  return "great apps";\n}`}
        className="bottom-1/3 right-8 leading-relaxed"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 pt-24 pb-16">
          {/* Text content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            <motion.p
              variants={fadeUp}
              className="font-mono text-primary text-sm mb-4 tracking-wider"
            >
              {t.hero.greeting}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-balance mb-4"
            >
              {t.hero.name}
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 h-9"
            >
              <TypingEffect words={t.hero.roles} />
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8"
            >
              {t.hero.description}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <button
                onClick={scrollToProjects}
                className="group relative px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_oklch(0.75_0.18_200/0.4)] active:scale-95"
              >
                <span className="relative z-10">{t.hero.cta_projects}</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              </button>
              <button
                onClick={scrollToContact}
                className="px-6 py-3 rounded-lg border border-border font-semibold text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
              >
                {t.hero.cta_contact}
              </button>
            </motion.div>

            {/* Social links */}
            <motion.div
              variants={fadeUp}
              className="flex gap-4 mt-8 justify-center lg:justify-start"
            >
              <a
                href="https://www.linkedin.com/in/halimaslyk/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://bionluk.com/halimaslyk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label="Bionluk"
              >
                <BriefcaseBusiness size={20} />
              </a>
            </motion.div>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex-shrink-0"
          >
            <TerminalCard
              lines={[
                t.hero.terminal_line1,
                t.hero.terminal_line2,
                t.hero.terminal_line3,
                t.hero.terminal_line4,
                t.hero.terminal_line5,
                t.hero.terminal_line6,
              ]}
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="flex justify-center pb-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown size={18} className="text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
