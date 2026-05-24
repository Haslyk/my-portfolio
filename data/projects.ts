export interface Project {
  id: string;
  title: string;
  description: {
    en: string;
    tr: string;
  };
  image: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "enterprise-dashboard",
    title: "Kurumsal Yönetim Dashboardları",
    description: {
      en: "Frontend migration and component architecture work for two enterprise management dashboards, focused on maintainability, fast feature delivery, and clean user flows.",
      tr: "İki farklı kurumsal yönetim paneli için frontend mimarisi, modüler bileşen yapısı ve sürdürülebilir geliştirme süreçleri üzerine yapılan çalışma.",
    },
    image: "/projects/devflow.jpg",
    technologies: ["React", "Tailwind CSS", "Component Architecture", "Git", "Jira"],
    featured: true,
  },
  {
    id: "ai-vision",
    title: "Yapay Zeka ve Görüntü İşleme",
    description: {
      en: "Computer vision solutions built with OpenCV and YOLO, integrated into commercial products and performance-focused mobile workflows.",
      tr: "OpenCV ve YOLO ile ticari ürünlere entegre edilen görüntü işleme çözümleri ve performans odaklı mobil iş akışları.",
    },
    image: "/projects/mlvision.jpg",
    technologies: ["Python", "OpenCV", "YOLO", "TensorFlow", "PyTorch"],
    featured: true,
  },
  {
    id: "cms-platform",
    title: "İçerik Yönetim Sistemi",
    description: {
      en: "CMS interfaces designed around complex data structures, editorial workflows, and user experience for content management operations.",
      tr: "Karmaşık veri yapıları, editoryal akışlar ve kullanıcı deneyimi odağında geliştirilen CMS arayüzleri.",
    },
    image: "/projects/apisync.jpg",
    technologies: ["React", "CMS", "REST API", "Data Modeling", "UX"],
    featured: true,
  },
  {
    id: "task-management",
    title: "Görev Yönetim Sistemi",
    description: {
      en: "An end-to-end task management system built with Node.js and MongoDB to digitize internal operations and improve team coordination.",
      tr: "Node.js ve MongoDB ile şirket içi operasyonları dijitalleştirmek ve ekip koordinasyonunu iyileştirmek için geliştirilen görev yönetim sistemi.",
    },
    image: "/projects/portfoliokit.jpg",
    technologies: ["Node.js", "MongoDB", "REST API", "Postman"],
    featured: false,
  },
  {
    id: "mobile-startup",
    title: "Cross-Platform Mobil Uygulama",
    description: {
      en: "A React Native mobile application developed for a Germany-based startup with frontend performance improvements for a smoother experience.",
      tr: "Almanya merkezli bir startup için React Native ile geliştirilen, performans optimizasyonları yapılmış cross-platform mobil uygulama.",
    },
    image: "/projects/devflow.jpg",
    technologies: ["React Native", "Mobile", "Performance", "UX"],
    featured: false,
  },
  {
    id: "ecommerce-integrations",
    title: "E-Ticaret API Entegrasyonları",
    description: {
      en: "Private API integrations for e-Shopify ecosystems, supporting enterprise ecommerce operations and digital workflow automation.",
      tr: "E-Shopify ekosistemleri için özel API entegrasyonları, kurumsal e-ticaret operasyonları ve dijital iş akışı otomasyonları.",
    },
    image: "/projects/apisync.jpg",
    technologies: ["REST API", "Shopify", "Backend", "Automation"],
    featured: false,
  },
];
