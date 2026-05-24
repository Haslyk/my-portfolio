"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SectionLabel } from "@/components/section-label";
import { projects } from "@/data/projects";
import { stagger, scaleIn } from "@/lib/motion";

export function Projects() {
  const { t, locale } = useI18n();

  return (
    <section id="projects" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionLabel
          label={t.projects.section_label}
          title={t.projects.title}
          titleAccent={t.projects.title_accent}
          subtitle={t.projects.subtitle}
        />

        {/* Featured projects — large cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid lg:grid-cols-2 gap-6 mb-6"
        >
          {projects.filter((p) => p.featured).slice(0, 2).map((project) => (
            <motion.article
              key={project.id}
              variants={scaleIn}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl overflow-hidden cyan-border hover:border-primary/60 transition-all duration-300 hover:glow-cyan group flex flex-col"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Source code"
                    >
                      <Github size={15} />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Live demo"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {project.description[locale]}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="tag">{tech}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Other projects — compact cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.filter((p) => p.featured).slice(2).concat(projects.filter((p) => !p.featured)).map((project) => (
            <motion.article
              key={project.id}
              variants={scaleIn}
              whileHover={{ y: -3 }}
              className="glass rounded-xl p-5 cyan-border hover:border-primary/50 transition-all duration-300 group flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-foreground">{project.title}</h3>
                <div className="flex gap-1.5">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Source code"
                    >
                      <Github size={15} />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Live demo"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {project.description[locale]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="tag text-[11px]">{tech}</span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="tag text-[11px]">+{project.technologies.length - 3}</span>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Placeholder notice */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs font-mono text-muted-foreground/40"
        >
          {/* {t.projects.placeholder_notice} */}
        </motion.p>
      </div>
    </section>
  );
}
