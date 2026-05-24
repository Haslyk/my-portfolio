"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface SectionLabelProps {
  label: string;
  title: string;
  titleAccent: string;
  subtitle?: string;
}

export function SectionLabel({ label, title, titleAccent, subtitle }: SectionLabelProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mb-12 md:mb-16"
    >
      <span className="tag mb-4 inline-block">
        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-balance">
        {title}{" "}
        <span className="text-primary glow-cyan-text">{titleAccent}</span>
      </h2>
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
