"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { fadeUp, stagger, scaleIn } from "@/lib/motion";

export function About() {
  const { t, locale } = useI18n();

  const stats = [
    { value: t.about.stat_1_value, label: t.about.stat_1_label },
    { value: t.about.stat_2_value, label: t.about.stat_2_label },
    { value: t.about.stat_3_value, label: t.about.stat_3_label },
  ];

  return (
    <section id="about" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionLabel
          label={t.about.section_label}
          title={t.about.title}
          titleAccent={t.about.title_accent}
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Bio */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-4"
          >
            {[t.about.bio_1, t.about.bio_2, t.about.bio_3].map((text, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-muted-foreground leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="glass rounded-xl p-6 cyan-border group hover:border-primary/50 transition-all duration-300 hover:glow-cyan"
              >
                <div className="text-4xl font-bold text-primary glow-cyan-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
                <div className="mt-3 h-px w-8 bg-primary/50 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}

            {/* Dev status badge */}
            <motion.div
              variants={scaleIn}
              className="glass rounded-xl p-5 flex items-center gap-4"
            >
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-60" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {locale === "tr" ? "Müsait" : "Available"}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {locale === "tr" ? "Proje ve iş birliklerine açık" : "Open to opportunities"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
