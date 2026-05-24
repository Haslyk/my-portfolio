"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { skillCategories } from "@/data/skills";
import { stagger, scaleIn } from "@/lib/motion";

export function Skills() {
  const { t, locale } = useI18n();

  return (
    <section id="skills" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionLabel
          label={t.skills.section_label}
          title={t.skills.title}
          titleAccent={t.skills.title_accent}
          subtitle={t.skills.subtitle}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {skillCategories.map((category) => {
            const Icon = category.icon;

            return (
              <motion.article
                key={category.id}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className="glass rounded-xl min-h-48 p-7 cyan-border hover:border-primary/60 transition-all duration-300 hover:glow-cyan"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/35 flex items-center justify-center text-primary">
                    <Icon size={23} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {category.title[locale]}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
