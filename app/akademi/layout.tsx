import type { Metadata } from 'next';
import { AkademiQueryProvider } from '@/components/akademi/AkademiQueryProvider';

export const metadata: Metadata = {
  title: 'Halimaslyk Akademi | Etkileşimli Ders ve Uygulama Portalı',
  description:
    'Ağ Temelleri, Bilgisayar Donanımı ve Görsel Programlama dersleri için etkileşimli uygulama ve öğrenci çalışma portalı.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AkademiLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <AkademiQueryProvider>{children}</AkademiQueryProvider>;
}
