export * from './types';
export * from './curriculum';

export type CourseCode = 'ag-temelleri' | 'pc-donanimi' | 'gorsel-programlama';

export interface CourseCatalogItem {
  code: CourseCode;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  defaultVisible: boolean;
  isReady: boolean;
  href: string;
  badgeText: string;
}

export const AKADEMI_COURSES_CATALOG: CourseCatalogItem[] = [
  {
    code: 'ag-temelleri',
    title: 'Ağ Temelleri (Ağ Atölyem)',
    shortTitle: 'Ağ Temelleri',
    subtitle: '5 Haftalık Etkileşimli Ağ Laboratuvarı',
    description:
      'Ağ cihazlarını tanıma, yıldız topolojisiyle yerel ağ kurma, paket yolculuğu, IP adresleme, ARP simülasyonu ve ağ sorun çözme uygulamaları.',
    defaultVisible: true,
    isReady: true,
    href: '/akademi/ag-temelleri',
    badgeText: 'Aktif Panel · 5 Hafta'
  },
  {
    code: 'pc-donanimi',
    title: 'Bilgisayar Donanımı (Donanım Atölyem)',
    shortTitle: 'PC Donanımı',
    subtitle: '5 Haftalık Etkileşimli Donanım Laboratuvarı',
    description:
      'Kasa içi bileşen keşfi, RAM sökme/takma simülasyonu, hava akışı, görüntü sorun giderme, kablo-port eşleştirme ve ağ donanımları.',
    defaultVisible: true,
    isReady: true,
    href: '/akademi/pc-donanimi',
    badgeText: 'Aktif Panel · 5 Hafta'
  },
  {
    code: 'gorsel-programlama',
    title: 'Görsel Programlama Atölyesi (Excel VBA)',
    shortTitle: 'Görsel Programlama',
    subtitle: '5 Haftalık Etkileşimli UserForm & VBA Atölyesi',
    description:
      'UserForm tasarımı, değişkenler ve hesaplamalar, koşullu kontroller, ListBox ve döngüler, olay yönetimi ve Excel VBA mini projesi.',
    defaultVisible: true,
    isReady: true,
    href: '/akademi/gorsel-programlama',
    badgeText: 'Aktif Panel · 5 Hafta'
  }
];
