import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Monitor and analyze student performance across coding platforms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
