import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies Policy | Statera',
  description: 'Learn about how Statera uses cookies and similar technologies on our website.',
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
