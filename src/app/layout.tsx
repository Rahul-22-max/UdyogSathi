import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'UdyogSathi — Industrial Approvals & Compliance Management',
  description:
    'UdyogSathi helps entrepreneurs discover approvals, reuse verified documents, manage compliance, track applications, coordinate inspections, and explore government support schemes.',
  keywords: [
    'UdyogSathi',
    'Maharashtra Industrial Approvals',
    'Verified Document Reuse',
    'MPCB Consent to Establish',
    'DISH Factory Plan',
    'MIDC Water Connection',
    'Package Scheme of Incentives',
    'Industrial Compliance',
  ],
  authors: [{ name: 'State Industrial Single Window System' }],
  openGraph: {
    title: 'UdyogSathi — Industrial Approvals & Compliance Management',
    description: 'UdyogSathi helps entrepreneurs discover approvals, reuse verified documents, manage compliance, track applications, coordinate inspections, and explore government support schemes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased text-govText bg-govBg selection:bg-saffron selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
