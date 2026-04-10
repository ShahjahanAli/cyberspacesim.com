import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberSpace Sim — Tactical Cyber Security Simulation",
  description:
    "Train, simulate, and master real-world cyber security scenarios in a safe, interactive environment.",
  keywords: ["cyber security", "simulation", "penetration testing", "training", "red team", "blue team"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body suppressHydrationWarning className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
          <Navbar />
          <main className="flex flex-col flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
