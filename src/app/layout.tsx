import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Url Shortener",
  description: "A scalable and efficient URL shortener built with Next.js and TypeScript, designed to handle a high volume of users and provide seamless redirection.",
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Return the appropriate theme
    return currentTheme === 'dark' ? 'dark' : currentTheme === 'light' ? 'light' : (prefersDarkMode ? 'dark' : 'light');
  }
  return 'light'; // Fallback in case of server-side rendering
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = getInitialTheme();

  // Set the theme class on the document
  if (initialTheme === 'dark') {
    typeof document !== 'undefined' && document.documentElement.classList.add('dark');
  } else {
    typeof document !== 'undefined' && document.documentElement.classList.remove('dark');
  }

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
