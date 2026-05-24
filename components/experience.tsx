"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { experiences } from "@/data/experience";
import { stagger, fadeUp } from "@/lib/motion";

export function Experience() {
  const { t, locale } = useI18n();

  return (
    <section id="experience" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionLabel
          label={t.experience.section_label}
          title={t.experience.title}
          titleAccent={t.experience.title_accent}
          subtitle={t.experience.subtitle}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          <div className="absolute left-1/2 top-4 bottom-4 hidden w-px -translate-x-1/2 bg-primary/45 md:block" />

          <div className="space-y-8 md:space-y-14">
            {experiences.map((exp, index) => {
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={exp.id}
                  variants={fadeUp}
                  className={`relative grid md:grid-cols-2 md:gap-20 ${
                    isLeft ? "" : "md:[&>article]:col-start-2"
                  }`}
                >
                  <div className="absolute left-1/2 top-9 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_24px_oklch(0.75_0.18_200/0.75)] md:block" />

                  <motion.article
                    whileHover={{ y: -4 }}
                    className="glass rounded-xl p-6 md:p-7 cyan-border hover:border-primary/60 transition-all duration-300 hover:glow-cyan"
                  >
                    <div className="mb-5">
                      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                        {exp.period.start} — {exp.period.end ?? t.experience.present}
                      </span>
                      <div className="mt-3 flex items-center gap-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {exp.role[locale]}
                        </h3>
                        {exp.url && (
                          <a
                            href={exp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="View company"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-base text-muted-foreground">{exp.company}</p>
                    </div>

                    <ul className="space-y-3 mb-5">
                      {exp.bullets[locale].map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span key={tech} className="tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
