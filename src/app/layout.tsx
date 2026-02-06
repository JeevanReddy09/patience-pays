import './globals.css';
import { Fraunces, Space_Grotesk } from 'next/font/google';

const heading = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700']
});

const body = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  title: 'Patience Pays',
  description: 'Long-term investing rewards consistency.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
