export interface MinimalConfig {
  name: string;
  titles: string[]; // Sırayla veya yan yana gösterilecek unvanlar
  tagline: string;
  status: {
    available: boolean;
    text: string;
  };
  links: {
    label: string;
    href: string;
    icon: "linkedin" | "github" | "mail" | "external" | "instagram";
  }[];
  primaryAction?: {
    label: string;
    href: string;
  };
}

export const minimalConfig: MinimalConfig = {
  name: "Halim Aslıyüksek",
  titles: [
    "Yazılım Mühendisi",
    "Akademisyen",
    "Araştırmacı"
  ],
  tagline: "Yazılım sistemleri, veri bilimi ve yapay zeka odaklı çalışmalar yürütmekteyim.",
  status: {
    available: true,
    text: "Yeni projelere & akademik işbirliklerine açık",
  },
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/halimaslyk/",
      icon: "linkedin",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/halimaslyk/",
      icon: "instagram",
    },
  ],
};
