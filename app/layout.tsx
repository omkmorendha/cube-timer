import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cube Timer | Speedcubing Timer',
  description: 'A minimalist speedcubing timer with WCA-style scrambles, solve tracking, and statistics.',
  keywords: ['speedcubing', 'rubiks cube', 'timer', 'cubing', 'wca'],
  authors: [{ name: 'Cube Timer' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
