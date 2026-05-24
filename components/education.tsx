"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { education } from "@/data/experience";
import { stagger, scaleIn } from "@/lib/motion";

export function Education() {
  const { t, locale } = useI18n();

  return (
    <section id="education" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionLabel
          label={t.education.section_label}
          title={t.education.title}
          titleAccent={t.education.title_accent}
          subtitle={t.education.subtitle}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-5"
        >
          {education.map((edu) => (
            <motion.article
              key={edu.id}
              variants={scaleIn}
              whileHover={{ y: -5 }}
              className="glass rounded-xl p-6 cyan-border hover:border-primary/50 transition-all duration-300 hover:glow-cyan group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <GraduationCap size={21} className="text-primary" />
              </div>

              <h3 className="font-bold text-foreground leading-snug">
                {edu.degree[locale]}
              </h3>
              <p className="text-sm text-primary font-mono mt-2">{edu.institution}</p>

              <div className="flex flex-wrap items-center gap-2 my-4">
                <span className="text-xs font-mono text-muted-foreground bg-surface-2 px-3 py-1 rounded-full">
                  {edu.period.start} — {edu.period.end ?? t.experience.present}
                </span>
                {edu.gpa && (
                  <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                    GPA: {edu.gpa}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {edu.description[locale]}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
