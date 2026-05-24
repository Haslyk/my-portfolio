"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { stagger, scaleIn } from "@/lib/motion";

const CONTACT_LINKS = [
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/halimaslyk/",
    icon: Linkedin,
    handle: "linkedin.com/in/halimaslyk",
  },
  {
    key: "bionluk",
    href: "https://bionluk.com/halimaslyk",
    icon: BriefcaseBusiness,
    handle: "bionluk.com/halimaslyk",
  },
] as const;

export function Contact() {
  const { t } = useI18n();

  return (
    <section id="contact" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionLabel
          label={t.contact.section_label}
          title={t.contact.title}
          titleAccent={t.contact.title_accent}
          subtitle={t.contact.subtitle}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 gap-5 max-w-4xl"
        >
          {CONTACT_LINKS.map((link) => {
            const Icon = link.icon;
            const labelKey = `${link.key}_label` as keyof typeof t.contact;
            const descKey = `${link.key}_desc` as keyof typeof t.contact;

            return (
              <motion.a
                key={link.key}
                variants={scaleIn}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -6 }}
                className="group glass rounded-xl p-7 cyan-border hover:border-primary/70 hover:glow-cyan transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/35 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon size={25} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {t.contact[labelKey]}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-primary">{link.handle}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary transition-colors" size={22} />
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {t.contact[descKey]}
                </p>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
