export interface ExperienceItem {
  id: string;
  role: { en: string; tr: string };
  company: string;
  period: { start: string; end: string | null };
  description: { en: string; tr: string };
  bullets: { en: string[]; tr: string[] };
  technologies: string[];
  url?: string;
}

export interface EducationItem {
  id: string;
  degree: { en: string; tr: string };
  institution: string;
  period: { start: string; end: string | null };
  description: { en: string; tr: string };
  gpa?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: { en: string; tr: string };
  institution: string;
  phone: string;
}

export const experiences: ExperienceItem[] = [
  {
    id: "lusemta",
    role: {
      en: "Full-Stack Software Developer",
      tr: "Full-Stack Yazılım Geliştirici",
    },
    company: "Lusemta Yazılım",
    period: { start: "Şubat 2024", end: "Temmuz 2025" },
    description: {
      en: "Full-stack role focused on enterprise dashboards, CMS systems, and mobile application development.",
      tr: "Kurumsal dashboard, CMS ve mobil uygulama geliştirme odaklı full-stack rol.",
    },
    bullets: {
      en: [
        "Migrated two different enterprise management dashboard frontends for Diversey from React and Tailwind CSS to a modular component architecture, improving maintainability and feature delivery speed.",
        "Built frontend solutions for Apotemi Yayınları's CMS, optimizing complex data structures and creating user-focused content management screens.",
        "Developed a cross-platform mobile application with React Native for a Germany-based startup and improved frontend performance for a smoother user experience.",
        "Solved technical blockers analytically inside the team and used Git/Jira effectively to shorten project delivery cycles.",
      ],
      tr: [
        "Diversey için iki farklı kurumsal yönetim panelinin frontend mimarisini React ve Tailwind CSS ile sağlamlaştırdım; projeyi modüler bileşen yapısına geçirerek sürdürülebilirliği ve yeni özellik ekleme hızını artırdım.",
        "Apotemi Yayınları'nın CMS geliştirme sürecinde karmaşık veri yapılarını optimize eden, kullanıcı deneyimini öne alan içerik yönetim ekranları geliştirdim.",
        "Almanya merkezli bir startup için React Native ile cross-platform mobil uygulama geliştirdim ve frontend performans optimizasyonlarıyla daha akıcı bir deneyim sağladım.",
        "Takım içinde karşılaşılan teknik darboğazlara analitik çözümler getirerek Git/Jira gibi araçları etkin kullandım ve proje teslim sürelerini kısalttım.",
      ],
    },
    technologies: ["React", "Tailwind CSS", "React Native", "CMS", "Git", "Jira"],
  },
  {
    id: "yalova-belediyesi",
    role: {
      en: "Software Developer",
      tr: "Yazılım Geliştirici",
    },
    company: "Yalova Belediyesi",
    period: { start: "Ağustos 2023", end: "Eylül 2023" },
    description: {
      en: "Internship focused on internal digitalization, desktop GUI development, and large-scale municipal data workflows.",
      tr: "Belediye içi dijitalleşme, masaüstü arayüz geliştirme ve büyük ölçekli veri işleme süreçlerine odaklanan staj.",
    },
    bullets: {
      en: [
        "Developed a Java-based desktop GUI to help personnel query and manage large datasets more easily, optimizing performance with a layered architecture.",
        "Designed data processing algorithms with Python and SQL to transform large municipal datasets into meaningful reports.",
        "Integrated data protection and security protocols into system workflows, improving alignment with KVKK compliance and data privacy standards.",
        "Automated manual data entry tasks with Java search and automation scripts, reducing operational errors.",
      ],
      tr: [
        "Personelin büyük veri setlerini kolayca sorgulayıp yönetebilmesi için Java tabanlı masaüstü GUI geliştirdim; katmanlı mimariyle performansı optimize ettim.",
        "Python ve SQL kullanarak veri işleme algoritmaları kurguladım ve büyük ölçekli belediye verilerinin anlamlı raporlara dönüştürülmesini sağladım.",
        "Veri koruma ve güvenliği protokollerini sistem süreçlerine entegre ederek belediye dijital servislerinin KVKK uyumluluğu ve veri gizliliği standartlarını güçlendirdim.",
        "Java arayüzü ve otomasyon scriptleriyle manuel veri girişinden kaynaklanan hataları azaltarak operasyonel verimliliği artırdım.",
      ],
    },
    technologies: ["Java", "Python", "SQL", "GUI", "Automation", "KVKK"],
  },
  {
    id: "aktek-bilisim",
    role: {
      en: "Software Developer",
      tr: "Yazılım Geliştirici",
    },
    company: "Aktek Bilişim",
    period: { start: "Ağustos 2022", end: "Eylül 2022" },
    description: {
      en: "Internship focused on operational workflow digitalization and a task management system.",
      tr: "Operasyonel iş akışlarını dijitalleştirme ve görev yönetim sistemi geliştirme odaklı staj.",
    },
    bullets: {
      en: [
        "Built an end-to-end task management system with Node.js to digitize internal operational workflows and improve team coordination.",
        "Designed a flexible and scalable NoSQL data model with MongoDB, improving dynamic data handling and query performance.",
        "Created a RESTful API architecture for system integration and tested comprehensive scenarios with Postman.",
        "Optimized response times with asynchronous programming and designed a responsive interface accessible across devices.",
      ],
      tr: [
        "Şirket içi operasyonel iş akışlarını dijitalleştirmek ve ekipler arası koordinasyonu optimize etmek için Node.js ile uçtan uca görev yönetim sistemi geliştirdim.",
        "MongoDB kullanarak esnek ve ölçeklenebilir bir NoSQL veri modeli tasarladım; görevlerin dinamik yapısını ve kullanıcı yetkilendirmelerini yüksek performansla yönetecek altyapı sundum.",
        "Sistem entegrasyonu için RESTful API mimarisini kurguladım ve Postman üzerinden kapsamlı test senaryoları yürüterek kararlılığı sağladım.",
        "Asenkron programlama teknikleriyle yanıt sürelerini optimize ettim ve tüm cihazlardan erişilebilir responsive bir arayüz tasarladım.",
      ],
    },
    technologies: ["Node.js", "MongoDB", "REST API", "Postman", "Responsive UI"],
  },
  {
    id: "bionluk",
    role: {
      en: "Freelance Full-Stack Software Developer",
      tr: "Freelance Full-Stack Yazılım Geliştirici",
    },
    company: "Bionluk",
    period: { start: "Aralık 2020", end: null },
    description: {
      en: "Freelance software development across web, mobile, AI, ecommerce integrations, and deployment workflows.",
      tr: "Web, mobil, yapay zeka, e-ticaret entegrasyonları ve deployment süreçlerinde freelance yazılım geliştirme.",
    },
    bullets: {
      en: [
        "Built scalable SaaS architectures and end-to-end web solutions with JS/TS, Python, PHP, Java, React, Angular, Vue, Node.js, Laravel, and Django.",
        "Delivered AI and computer vision projects by integrating OpenCV and YOLO into commercial products and performance-focused mobile workflows.",
        "Optimized SQL and NoSQL databases by project needs and created sustainable deployment pipelines with Docker, AWS, and CI/CD.",
        "Integrated custom e-Shopify ecosystems with private APIs, digitizing enterprise workflows and ecommerce operations at consulting depth.",
      ],
      tr: [
        "JS/TS, Python, PHP ve Java dilleriyle; React/Angular/Vue ve Node.js/Laravel/Django frameworkleriyle ölçeklenebilir SaaS mimarileri ve uçtan uca web çözümleri geliştirdim.",
        "OpenCV ve YOLO teknolojilerini ticari ürünlere entegre ederek yapay zeka ve görüntü işleme odaklı projeler geliştirdim; React Native ve Flutter ile performans odaklı mobil uygulamalar teslim ettim.",
        "SQL ve NoSQL veritabanlarını proje ihtiyaçlarına göre optimize ederek Docker, AWS ve CI/CD süreçleriyle sürdürülebilir deployment altyapıları kurdum.",
        "Özel API entegrasyonları ile e-Shopify ekosistemlerinde kurumsal işletmelerin e-ticaret operasyonlarını teknik danışmanlık seviyesinde dijitalleştirdim.",
      ],
    },
    technologies: ["React", "Node.js", "Python", "PHP", "Java", "YOLO", "Docker", "AWS"],
    url: "https://bionluk.com/halimaslyk",
  },
];

export const education: EducationItem[] = [
  {
    id: "edu-master",
    degree: {
      en: "Software Engineering - Master's Degree",
      tr: "Yazılım Mühendisliği - Yüksek Lisans",
    },
    institution: "Samsun Üniversitesi",
    period: { start: "2024", end: "2026" },
    description: {
      en: "Graduate studies in software engineering.",
      tr: "Yazılım mühendisliği alanında yüksek lisans eğitimi.",
    },
    gpa: "3.86",
  },
  {
    id: "edu-bachelor",
    degree: {
      en: "Software Engineering - Bachelor's Degree",
      tr: "Yazılım Mühendisliği - Lisans",
    },
    institution: "Samsun Üniversitesi",
    period: { start: "2020", end: "2024" },
    description: {
      en: "Bachelor's degree focused on software engineering fundamentals and applied development.",
      tr: "Yazılım mühendisliği temelleri ve uygulamalı geliştirme odaklı lisans eğitimi.",
    },
    gpa: "3.30",
  },
  {
    id: "edu-high-school",
    degree: {
      en: "High School",
      tr: "Lise",
    },
    institution: "Çiftlikköy Atatürk Anadolu Lisesi",
    period: { start: "2016", end: "2020" },
    description: {
      en: "High school education completed with a diploma score of 91.",
      tr: "Lise eğitimi 91 diploma puanı ile tamamlandı.",
    },
  },
];

export const references: ReferenceItem[] = [
  {
    id: "ozgur-tonkal",
    name: "Dr. Öğr. Üyesi Özgür Tonkal",
    title: { en: "Assistant Professor", tr: "Dr. Öğr. Üyesi" },
    institution: "Samsun Üniversitesi",
    phone: "0505 501 0652",
  },
  {
    id: "suleyman-tarim",
    name: "Süleyman Talip Tarım",
    title: {
      en: "Founder of Lusemta Yazılım",
      tr: "Lusemta Yazılım Kurucu",
    },
    institution: "Lusemta Yazılım",
    phone: "0534 541 1881",
  },
  {
    id: "ali-furkan-bodur",
    name: "Ali Furkan Bodur",
    title: { en: "Computer Engineer", tr: "Bilgisayar Mühendisi" },
    institution: "Samsun Üniversitesi",
    phone: "0546 808 5752",
  },
];
