import { I18nProvider } from "@/lib/i18n-context";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Skills } from "@/components/skills";
import { Experience } from "@/components/experience";
import { Education } from "@/components/education";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { SiteBackground } from "@/components/site-background";

export default function FullPortfolio() {
  return (
    <I18nProvider>
      <SiteBackground />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </I18nProvider>
  );
}
